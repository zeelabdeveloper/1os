const Onboarding = require("../../models/jobs/Onboarding");
const LetterTemplate = require("../../models/LetterTemplate");
const sendEmail = require("../../services/forgetpassmail");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const job = require("../../models/jobs/jobsSchema");
const { EmailConfig } = require("../../helper/emailConfig");
const letterTemplateController = {
  // Get all templates for the authenticated user
  getAllTemplates: async (req, res) => {
    try {
      const templates = await LetterTemplate.find();
      res.json({ success: true, data: templates });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  viewLetter: async (req, res) => {
    try {
      const { applicationId } = req.query;
      console.log(applicationId);
      if (!applicationId) {
        return res.status(400).json({
          success: false,
          message: "Application ID is required",
        });
      }

      const onboarding = await Onboarding.findOne({
        applicationId,
      }).populate({
        path: "Letters.templateUsed",
        model: "LetterTemplate",
        select: "name type content",
      });

      if (!onboarding) {
        return res.status(404).json({
          success: false,
          message: "Onboarding record not found",
        });
      }

      // Format the response data
      const letters = onboarding.Letters.map((letter) => ({
        _id: letter._id,
        type: letter.type,
        templateName: letter.templateUsed?.name || "Unknown Template",
        templateContent: letter.templateUsed?.content || "",
        sentAt: letter.sentAt,
        recipient: letter.recipient,
        downloadUrl: `/api/v1/letters/download/${letter._id}`,
      }));

      res.json({
        success: true,
        data: letters,
      });
    } catch (error) {
      console.error("Error fetching letters:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
  // Get templates by type
  getTemplatesByType: async (req, res) => {
    try {
      const templates = await LetterTemplate.find({
        createdBy: req.user.id,
        type: req.params.type,
      });
      res.json({ success: true, data: templates });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Get single template
  getTemplate: async (req, res) => {
    try {
      const template = await LetterTemplate.findOne({
        _id: req.params.id,
        createdBy: req.user.id,
      });

      if (!template) {
        return res
          .status(404)
          .json({ success: false, message: "Template not found" });
      }

      res.json({ success: true, data: template });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Create new template
  createTemplate: async (req, res) => {
    try {
      const { name, type, content, variables } = req.body;
      console.log(req.body);
      // Validate variables
      if (variables && variables.some((v) => !v.name || !v.description)) {
        return res.status(400).json({
          success: false,
          message: "All variables must have name and description",
        });
      }

      const newTemplate = new LetterTemplate({
        name,
        type,
        content,
        variables: variables || [],
        createdBy: req?.user?.id,
      });

      await newTemplate.save();

      res.status(201).json({
        success: true,
        message: "Template created successfully",
        data: newTemplate,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Update template
  updateTemplate: async (req, res) => {
    try {
      const { name, type, content, variables } = req.body;

      // Validate variables
      if (variables && variables.some((v) => !v.name || !v.description)) {
        return res.status(400).json({
          success: false,
          message: "All variables must have name and description",
        });
      }

      const updatedTemplate = await LetterTemplate.findOneAndUpdate(
        { _id: req.params.id },
        { name, type, content, variables: variables || [] },
        { new: true }
      );

      if (!updatedTemplate) {
        return res
          .status(404)
          .json({ success: false, message: "Template not found" });
      }

      res.json({
        success: true,
        message: "Template updated successfully",
        data: updatedTemplate,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Delete template
  deleteTemplate: async (req, res) => {
    try {
      const deletedTemplate = await LetterTemplate.findOneAndDelete({
        _id: req.params.id,
      });

      if (!deletedTemplate) {
        return res
          .status(404)
          .json({ success: false, message: "Template not found" });
      }

      res.json({
        success: true,
        message: "Template deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Generate letter from template

  // generateLetter: async (req, res) => {
  //   try {
  //     const template = await LetterTemplate.findOne({
  //       _id: req.body.templateId,
  //     });

  //     if (!template) {
  //       return res
  //         .status(404)
  //         .json({ success: false, message: "Template not found" });
  //     }

  //     const ApplicationDetails = await Onboarding.findOne({
  //       applicationId: req.body.applicationId,
  //     }).populate("applicationId");

  //     if (!ApplicationDetails) {
  //       return res
  //         .status(404)
  //         .json({ success: false, message: "Application not found" });
  //     }

  //     const user = ApplicationDetails.applicationId;
  //     const jobDetails = await job.findById(user.jobId);

  //     if (template.type === "offer") {
  //       // Generate stylish PDF offer letter
  //       const doc = new PDFDocument({
  //         size: "A4",
  //         margin: 50,
  //         layout: "portrait",
  //         info: {
  //           Title: `Offer Letter - ${user.name}`,
  //           Author: "Zeelab Pharmacy HR",
  //         },
  //       });

  //       // Create a temporary file path
  //       const filePath = path.join(
  //         __dirname,
  //         "../../temp",
  //         `offer_${user._id}.pdf`
  //       );
  //       const writeStream = fs.createWriteStream(filePath);
  //       doc.pipe(writeStream);

  //       // Add stylish header
  //       doc
  //         .image(
  //           path.join(__dirname, "../../public/img/zeelab-logo.png"),
  //           50,
  //           45,
  //           { width: 100 }
  //         )
  //         .fillColor("#444444")
  //         .fontSize(20)
  //         .text("OFFER LETTER", 200, 50, { align: "center" })
  //         .fontSize(10)
  //         .text("Zeelab Pharmacy Pvt. Ltd.", 200, 80, { align: "center" })
  //         .moveDown();

  //       // Add date
  //       doc
  //         .fontSize(10)
  //         .text(`Date: ${new Date().toLocaleDateString("en-IN")}`, {
  //           align: "right",
  //         })
  //         .moveDown();

  //       doc
  //         .fontSize(12)
  //         .text(`Dear ${user.name},`, { align: "left" })
  //         .moveDown(0.5)
  //         .text("We are pleased to offer you the position of:")
  //         .font("Helvetica-Bold")
  //         .text(jobDetails.title, { indent: 30 })
  //         .font("Helvetica")
  //         .moveDown();

  //       doc
  //         .text("The terms of your employment are as follows:")
  //         .moveDown(0.5)
  //         .text(`• Position: ${jobDetails.title}`, { indent: 30 })
  //         .text(`• Department: ${jobDetails.department}`, { indent: 30 })
  //         .text(`• Joining Date: To be discussed`, { indent: 30 })
  //         .text(`• Compensation: As per discussion`, { indent: 30 })
  //         .moveDown();

  //       // Add standard clauses
  //       doc
  //         .text("This offer is contingent upon:")
  //         .moveDown(0.5)
  //         .text("1. Successful completion of background verification", {
  //           indent: 30,
  //         })
  //         .text("2. Submission of required documents", { indent: 30 })
  //         .text("3. Compliance with company policies", { indent: 30 })
  //         .moveDown();

  //       // Add closing
  //       doc
  //         .text(
  //           "We look forward to having you as part of our team. Please sign and return a copy of this letter to acknowledge your acceptance."
  //         )
  //         .moveDown(2)
  //         .text("Sincerely,")
  //         .moveDown(2)
  //         .text("___________________________")
  //         .text("HR Manager")
  //         .text("Zeelab Pharmacy Pvt. Ltd.")
  //         .moveDown()
  //         .text("Candidate Acceptance:")
  //         .moveDown(2)
  //         .text("___________________________")
  //         .text("Signature")
  //         .text("Date: ___________");

  //       // Finalize PDF
  //       doc.end();

  //       // Wait for PDF to be created
  //       await new Promise((resolve) => writeStream.on("finish", resolve));

  //       // Send email with PDF attachment
  //       const mailOptions = {
  //         from: `"Zeelab Pharmacy HR" <${process.env.MAIL_USER}>`,
  //         to: user.email,
  //         subject: `Offer Letter for ${jobDetails.title} Position`,
  //         html: `
  //                   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  //                       <div style="background-color: #22c55e; padding: 20px; text-align: center;">
  //                           <img src="https://zeelabpharmacy.com/img/logo.png" alt="Zeelab Pharmacy" style="height: 50px;">
  //                       </div>
  //                       <div style="padding: 20px;">
  //                           <h2 style="color: #22c55e;">Congratulations, ${user.name}!</h2>
  //                           <p>We are pleased to extend an offer for the position of <strong>${jobDetails.title}</strong> at Zeelab Pharmacy.</p>
  //                           <p>Please find your official offer letter attached with this email.</p>
  //                           <p>To accept this offer, please reply to this email or sign and return the attached document.</p>
  //                           <p>We look forward to welcoming you to our team!</p>
  //                           <br/>
  //                           <p>Best regards,<br/>
  //                           <strong>HR Team</strong><br/>
  //                           Zeelab Pharmacy Pvt. Ltd.</p>
  //                       </div>
  //                       <div style="background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 12px;">
  //                           <p>This is an automated email. Please do not reply directly to this message.</p>
  //                       </div>
  //                   </div>
  //               `,
  //         attachments: [
  //           {
  //             filename: `Zeelab_Offer_Letter_${user.name}.pdf`,
  //             path: filePath,
  //           },
  //         ],
  //       };

  //       const emailResult = await sendEmail(mailOptions);

  //       // Delete the temporary PDF file
  //       fs.unlinkSync(filePath);

  //       if (!emailResult.success) {
  //         return res.status(500).json({
  //           success: false,
  //           message:
  //             emailResult.error?.message ||
  //             "Failed to send email. Please try again.",
  //         });
  //       }

  //       // Update onboarding with letter details
  //       ApplicationDetails.Letters.push({
  //         type: "offer",
  //         sentAt: new Date(),
  //         recipient: user.email,
  //         templateUsed: template._id.toString(), // Ensure this is a string representation
  //       });
  //       await ApplicationDetails.save();
  //     }

  //     res.json({
  //       success: true,
  //       message: "Letter generated and sent successfully",
  //       ApplicationDetails,
  //     });
  //   } catch (error) {
  //     console.error("Error generating offer letter:", error);
  //     res.status(500).json({ success: false, message: "Server error" });
  //   }
  // },

  generateLetter: async (req, res) => {
    let tempFilePath = null;

    try {
      // Validate input
      if (!req.body.templateId || !req.body.applicationId) {
        return res.status(400).json({
          success: false,
          message: "Template ID and Application ID are required",
        });
      }

      // Create temp directory if it doesn't exist
      const tempDir = path.join(process.cwd(), "temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Find template
      const template = await LetterTemplate.findById(req.body.templateId);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template not found",
        });
      }

      // Find application details
      const ApplicationDetails = await Onboarding.findOne({
        applicationId: req.body.applicationId,
      }).populate("applicationId");

      if (!ApplicationDetails) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      const user = ApplicationDetails.applicationId;
      const jobDetails = await job.findById(user.jobId);

      if (!jobDetails) {
        return res.status(404).json({
          success: false,
          message: "Job details not found",
        });
      }
      // return console.log(template.type) appointment
      // Handle different letter types
      // if (template.type === "offer") {
      //   // Generate PDF
      //   const doc = new PDFDocument({
      //     size: "A4",
      //     margin: 50,
      //     layout: "portrait",
      //     info: {
      //       Title: `Offer Letter - ${user.name}`,
      //       Author: "Zeelab Pharmacy HR",
      //     },
      //   });

      //   // Create temp file path
      //   tempFilePath = path.join(
      //     tempDir,
      //     `offer_${user._id}_${Date.now()}.pdf`
      //   );
      //   const writeStream = fs.createWriteStream(tempFilePath);
      //   doc.pipe(writeStream);

      //   // PDF content
      //   doc
      //     .image(
      //       path.join(__dirname, "../../public/img/zeelab-logo.png"),
      //       50,
      //       45,
      //       { width: 100 }
      //     )
      //     .fillColor("#444444")
      //     .fontSize(20)
      //     .text("OFFER LETTER", 200, 50, { align: "center" })
      //     .fontSize(10)
      //     .text("Zeelab Pharmacy Pvt. Ltd.", 200, 80, { align: "center" })
      //     .moveDown();

      //   doc
      //     .fontSize(10)
      //     .text(`Date: ${new Date().toLocaleDateString("en-IN")}`, {
      //       align: "right",
      //     })
      //     .moveDown();

      //   doc
      //     .fontSize(12)
      //     .text(`Dear ${user.name},`, { align: "left" })
      //     .moveDown(0.5)
      //     .text("We are pleased to offer you the position of:")
      //     .font("Helvetica-Bold")
      //     .text(jobDetails.title, { indent: 30 })
      //     .font("Helvetica")
      //     .moveDown();

      //   doc
      //     .text("The terms of your employment are as follows:")
      //     .moveDown(0.5)
      //     .text(`• Position: ${jobDetails.title}`, { indent: 30 })
      //     .text(`• Department: ${jobDetails.department}`, { indent: 30 })
      //     .text(`• Joining Date: To be discussed`, { indent: 30 })
      //     .text(`• Compensation: As per discussion`, { indent: 30 })
      //     .moveDown();

      //   doc
      //     .text("This offer is contingent upon:")
      //     .moveDown(0.5)
      //     .text("1. Successful completion of background verification", {
      //       indent: 30,
      //     })
      //     .text("2. Submission of required documents", { indent: 30 })
      //     .text("3. Compliance with company policies", { indent: 30 })
      //     .moveDown();

      //   doc
      //     .text(
      //       "We look forward to having you as part of our team. Please sign and return a copy of this letter to acknowledge your acceptance."
      //     )
      //     .moveDown(2)
      //     .text("Sincerely,")
      //     .moveDown(2)
      //     .text("___________________________")
      //     .text("HR Manager")
      //     .text("Zeelab Pharmacy Pvt. Ltd.")
      //     .moveDown()
      //     .text("Candidate Acceptance:")
      //     .moveDown(2)
      //     .text("___________________________")
      //     .text("Signature")
      //     .text("Date: ___________");

      //   // Finalize PDF
      //   doc.end();

      //   // Wait for PDF to be created
      //   await new Promise((resolve, reject) => {
      //     writeStream.on("finish", resolve);
      //     writeStream.on("error", reject);
      //   });

      //   // Send email
      //   const mailOptions = {
      //     from: ` ${EmailConfig.mailUsername} <${EmailConfig.mailFromAddress}>`,
      //     to: user.email,
      //     subject: `Offer Letter for ${jobDetails.title} Position`,
      //     html: `
      //       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      //         <div style="background-color: #22c55e; padding: 20px; text-align: center;">
      //           <img src="https://zeelabpharmacy.com/img/logo.png" alt="Zeelab Pharmacy" style="height: 50px;">
      //         </div>
      //         <div style="padding: 20px;">
      //           <h2 style="color: #22c55e;">Congratulations, ${user.name}!</h2>
      //           <p>We are pleased to extend an offer for the position of <strong>${jobDetails.title}</strong> at Zeelab Pharmacy.</p>
      //           <p>Please find your official offer letter attached with this email.</p>
      //           <p>To accept this offer, please reply to this email or sign and return the attached document.</p>
      //           <p>We look forward to welcoming you to our team!</p>
      //           <br/>
      //           <p>Best regards,<br/>
      //           <strong>HR Team</strong><br/>
      //           Zeelab Pharmacy Pvt. Ltd.</p>
      //         </div>
      //         <div style="background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 12px;">
      //           <p>This is an automated email. Please do not reply directly to this message.</p>
      //         </div>
      //       </div>
      //     `,
      //     attachments: [
      //       {
      //         filename: `Zeelab_Offer_Letter_${user.name.replace(
      //           /\s+/g,
      //           "_"
      //         )}.pdf`,
      //         path: tempFilePath,
      //       },
      //     ],
      //   };

      //   const emailResult = await sendEmail(mailOptions);

      //   if (!emailResult.success) {
      //     throw new Error(emailResult.error?.message || "Failed to send email");
      //   }

      //   // Update onboarding with letter details
      //   ApplicationDetails.Letters.push({
      //     type: "offer",
      //     sentAt: new Date(),
      //     recipient: user.email,
      //     templateUsed: template._id,
      //   });
      //   await ApplicationDetails.save();
      // }

      if (template.type === "offer") {
        // Generate PDF
        const doc = new PDFDocument({
          size: "A4",
          margin: 50,
          layout: "portrait",
          info: {
            Title: `Offer Letter - ${user.name}`,
            Author: "Zeelab Pharmacy HR",
            Creator: "Zeelab Pharmacy HR System",
            Keywords: "offer,employment,Zeelab Pharmacy",
          },
        });

        // Create temp file path
        tempFilePath = path.join(
          tempDir,
          `Zeelab_Offer_Letter_${user.name.replace(
            /\s+/g,
            "_"
          )}_${Date.now()}.pdf`
        );
        const writeStream = fs.createWriteStream(tempFilePath);
        doc.pipe(writeStream);

        // ============ PAGE 1: HEADER & INTRODUCTION ============
        // Company Letterhead
        doc
          .image(
            path.join(__dirname, "../../public/img/zeelab-logo.png"),
            50,
            45,
            { width: 120 }
          )
          .fillColor("#333333")
          .fontSize(8)
          .text("Zeelab Pharmacy Pvt. Ltd.", 200, 50, { align: "center" })
          .fontSize(7)
          .text(
            "Corporate Office: 5th Floor, Tower B, Unitech Cyber Park",
            200,
            65,
            { align: "center" }
          )
          .text(
            "Sector 39, Gurugram, Haryana 122001 | www.zeelabpharmacy.com",
            200,
            75,
            { align: "center" }
          )
          .moveTo(50, 90)
          .lineTo(550, 90)
          .stroke("#22c55e", 2);

        // Offer Letter Title
        doc
          .fontSize(16)
          .fillColor("#22c55e")
          .font("Helvetica-Bold")
          .text("OFFER OF EMPLOYMENT", 200, 110, { align: "center" })
          .moveDown(1.5);

        // Date and Reference
        doc
          .fontSize(10)
          .fillColor("#333333")
          .text(
            `Date: ${new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}`,
            { align: "right" }
          )
          .moveDown(0.5)
          .text(
            `Ref: ZL/HR/${new Date().getFullYear()}/${Math.floor(
              1000 + Math.random() * 9000
            )}`,
            { align: "right" }
          )
          .moveDown(2);

        // Candidate Address
        doc
          .fontSize(10)
          .text(`${user.name}`, 50, 180)
          .text(`${user.address || "Address Not Specified"}`, 50, 195)
          .text(`${user.phone || ""}`, 50, 210)
          .moveDown(2);

        // Salutation
        doc.fontSize(11).text(`Dear ${user.name},`, 50, 230).moveDown(1);

        // Introduction Paragraph
        doc
          .fontSize(11)
          .fillColor("#333333")
          .text(
            `We are pleased to offer you the position of ${jobDetails.title} with Zeelab Pharmacy Pvt. Ltd. (hereinafter referred to as "the Company"), a leading pharmaceutical organization committed to delivering high-quality healthcare solutions. This letter sets out the terms and conditions of your employment.`,
            {
              align: "left",
              indent: 0,
              lineGap: 5,
              width: 500,
            }
          )
          .moveDown(1.5);

        // Position Details
        doc
          .font("Helvetica-Bold")
          .text("1. POSITION DETAILS:", 50)
          .font("Helvetica")
          .moveDown(0.5)
          .text(`• Designation: ${jobDetails.title}`, { indent: 30 })
          .text(`• Department: ${jobDetails.department}`, { indent: 30 })
          .text(
            `• Reporting To: ${jobDetails.reportingTo || "To be communicated"}`,
            { indent: 30 }
          )
          .text(
            `• Employment Type: ${jobDetails.employmentType || "Full-time"}`,
            { indent: 30 }
          )
          .text(
            `• Work Location: ${
              jobDetails.location || "Corporate Office, Gurugram"
            }`,
            { indent: 30 }
          )
          .moveDown(1.5);

        // Joining Details
        doc
          .font("Helvetica-Bold")
          .text("2. JOINING DETAILS:", 50)
          .font("Helvetica")
          .moveDown(0.5)
          .text(
            `• Proposed Joining Date: ${
              jobDetails.joiningDate ||
              "To be mutually agreed upon, not later than 30 days from offer acceptance"
            }`,
            { indent: 30 }
          )
          .text(
            `• Working Hours: 9:30 AM to 6:30 PM (Monday to Saturday, with alternate Saturdays off)`,
            { indent: 30 }
          )
          .moveDown(1.5);

        // ============ PAGE 2: COMPENSATION & BENEFITS ============
        doc.addPage();

        // Compensation Header
        doc
          .font("Helvetica-Bold")
          .text("3. COMPENSATION & BENEFITS:", 50, 50)
          .font("Helvetica")
          .moveDown(0.5);

        // Compensation Details
        const compensationText = [
          `• Fixed Annual CTC: ₹${
            jobDetails.ctc || "To be discussed"
          } (Cost to Company)`,
          `• Breakup: Basic Salary (50%), HRA (40%), Special Allowances (10%)`,
          `• Payment Mode: Monthly via bank transfer by 7th of each month`,
          `• Statutory Deductions: PF, ESI, TDS as applicable will be deducted`,
          `• Performance Bonus: Discretionary annual bonus based on company and individual performance`,
          `• Increments: Annual performance review with potential compensation adjustment`,
        ];

        compensationText.forEach((item) => {
          doc.text(item, { indent: 30 });
        });
        doc.moveDown(1);

        // Benefits
        doc
          .font("Helvetica-Bold")
          .text("4. EMPLOYEE BENEFITS:", 50)
          .font("Helvetica")
          .moveDown(0.5)
          .text(
            `As a Zeelab Pharmacy employee, you will be eligible for the following benefits:`,
            { indent: 30 }
          )
          .moveDown(0.5);

        const benefitsText = [
          "• Health Insurance: Comprehensive group health coverage for you and your family",
          "• Paid Time Off: 18 paid leaves per year + 12 public holidays",
          "• Professional Development: Sponsorship for relevant certifications and training",
          "• Employee Discount: Special rates on pharmaceutical products",
          "• Wellness Programs: Access to corporate wellness initiatives",
          "• Retirement Benefits: Provident Fund as per statutory requirements",
        ];

        benefitsText.forEach((item) => {
          doc.text(item, { indent: 30 });
        });
        doc.moveDown(1.5);

        // ============ PAGE 3: TERMS & CONDITIONS ============
        doc.addPage();

        // Terms Header
        doc
          .font("Helvetica-Bold")
          .text("5. TERMS & CONDITIONS:", 50, 50)
          .font("Helvetica")
          .moveDown(0.5);

        // Terms Content
        const termsText = [
          "5.1 This offer is contingent upon:",
          "   - Satisfactory verification of your employment history, education, and references",
          "   - Successful completion of any required medical examinations",
          "   - Submission of all required documents (educational certificates, previous employment records, etc.)",
          "   - Compliance with company policies and background verification",
          "",
          "5.2 Confidentiality & IP: All work produced during employment remains the sole property of Zeelab Pharmacy.",
          "",
          "5.3 Probation Period: 6 months from joining date, during which either party may terminate with 15 days notice.",
          "",
          "5.4 Notice Period: 30 days after confirmation, or salary in lieu thereof.",
          "",
          "5.5 Company Policies: You will be bound by all company policies as amended from time to time.",
          "",
          "5.6 Governing Law: This agreement shall be governed by the laws of India, with jurisdiction in Gurugram.",
        ];

        termsText.forEach((item) => {
          doc.text(item, { indent: 20 });
        });
        doc.moveDown(2);

        // About Zeelab Pharmacy
        doc
          .font("Helvetica-Bold")
          .text("ABOUT ZEELAB PHARMACY:", 50)
          .font("Helvetica")
          .moveDown(0.5)
          .text(
            "Zeelab Pharmacy Pvt. Ltd. is a rapidly growing pharmaceutical company committed to making quality healthcare affordable and accessible. With a strong presence in retail pharmacy, wholesale distribution, and institutional supplies, we serve thousands of customers across North India. Our mission is to improve lives through innovative healthcare solutions while maintaining the highest standards of ethics and professionalism.",
            {
              lineGap: 5,
              width: 500,
            }
          )
          .moveDown(2);

        // Acceptance Section
        doc
          .font("Helvetica-Bold")
          .text("ACCEPTANCE OF OFFER", 200, undefined, { align: "center" })
          .font("Helvetica")
          .moveDown(1)
          .text(
            "We are excited about the prospect of you joining our team. Please sign and return this letter within 7 days to indicate your acceptance of this offer.",
            {
              align: "center",
              width: 450,
            }
          )
          .moveDown(3);

        // Signature Blocks
        doc
          .text("For Zeelab Pharmacy Pvt. Ltd.", 100, undefined)
          .moveDown(3)
          .text("___________________________", 100, undefined)
          .text("Authorized Signatory", 100, undefined)
          .text("HR Department", 100, undefined)
          .moveDown(1)
          .text("Date: ___________", 100, undefined)
          .moveDown(3)
          .text("Candidate Acceptance", 350, undefined)
          .moveDown(3)
          .text("___________________________", 350, undefined)
          .text("Signature", 350, undefined)
          .text("Full Name: ___________________", 350, undefined)
          .text("Date: ___________", 350, undefined);

        // Footer
        doc
          .fontSize(8)
          .fillColor("#666666")
          .text(
            "This is a computer-generated document and does not require a physical signature.",
            200,
            750,
            { align: "center" }
          )
          .text("Confidential - For intended recipient only", 200, 765, {
            align: "center",
          });

        // Finalize PDF
        doc.end();

        // Wait for PDF to be created
        await new Promise((resolve, reject) => {
          writeStream.on("finish", resolve);
          writeStream.on("error", reject);
        });

        // Send email with enhanced HTML
        const mailOptions = {
          from: `Zeelab Pharmacy HR <${EmailConfig.mailFromAddress}>`,
          to: user.email,
          cc: "hr@zeelabpharmacy.com",
          subject: `Offer of Employment - ${jobDetails.title} Position | Zeelab Pharmacy`,
          html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; }
                .header { background-color: #22c55e; padding: 30px 20px; text-align: center; }
                .logo { height: 60px; }
                .content { padding: 30px 20px; }
                .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
                h1 { color: #22c55e; font-size: 24px; margin-bottom: 25px; }
                p { margin-bottom: 15px; }
                .highlight-box { background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; }
                .signature { margin-top: 30px; font-style: italic; color: #555; }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="https://zeelabpharmacy.com/img/logo.png" alt="Zeelab Pharmacy" class="logo">
            </div>
            
            <div class="content">
                <h1>Congratulations, ${user.name}!</h1>
                
                <p>On behalf of Zeelab Pharmacy Pvt. Ltd., we are delighted to extend an offer for the position of <strong>${
                  jobDetails.title
                }</strong> in our ${jobDetails.department} department.</p>
                
                <div class="highlight-box">
                    <p><strong>Your official offer letter is attached with this email.</strong> This document contains important information about your compensation, benefits, and terms of employment.</p>
                </div>
                
                <p><strong>Next Steps:</strong></p>
                <ol>
                    <li>Review the attached offer letter carefully</li>
                    <li>Sign and return the document within 7 days</li>
                    <li>Reply to this email with any questions</li>
                    <li>Our HR team will contact you for onboarding formalities</li>
                </ol>
                
                <p>We believe your skills and experience will be valuable assets to our organization, and we look forward to welcoming you to the Zeelab Pharmacy family.</p>
                
                <div class="signature">
                    <p>Best regards,</p>
                    <p><strong>HR Team</strong><br>
                    Zeelab Pharmacy Pvt. Ltd.<br>
                    Phone: +91-124-4123456<br>
                    Email: hr@zeelabpharmacy.com</p>
                </div>
            </div>
            
            <div class="footer">
                <p>This is an automated message. Please do not reply directly to this email.</p>
                <p>© ${new Date().getFullYear()} Zeelab Pharmacy Pvt. Ltd. All rights reserved.</p>
            </div>
        </body>
        </html>
        `,
          attachments: [
            {
              filename: `Zeelab_Pharmacy_Offer_Letter_${user.name.replace(
                /\s+/g,
                "_"
              )}.pdf`,
              path: tempFilePath,
            },
          ],
        };

        const emailResult = await sendEmail(mailOptions);

        if (!emailResult.success) {
          throw new Error(emailResult.error?.message || "Failed to send email");
        }

        // Update onboarding with letter details
        ApplicationDetails.Letters.push({
          type: "offer",
          sentAt: new Date(),
          recipient: user.email,
          templateUsed: template._id,
          documentPath: tempFilePath,
          reference: `ZL/HR/${new Date().getFullYear()}/${Math.floor(
            1000 + Math.random() * 9000
          )}`,
        });
        await ApplicationDetails.save();
      }

      if (template.type === "appointment") {
        // Generate PDF
        const doc = new PDFDocument({
          size: "A4",
          margin: 50,
          layout: "portrait",
          info: {
            Title: `Appointment Letter - ${user.name}`,
            Author: "Zeelab Pharmacy HR",
            Creator: "Zeelab Pharmacy HR System",
            Keywords: "appointment,employment,Zeelab Pharmacy",
          },
        });

        // Create temp file path
        tempFilePath = path.join(
          tempDir,
          `Zeelab_Appointment_Letter_${user.name.replace(
            /\s+/g,
            "_"
          )}_${Date.now()}.pdf`
        );
        const writeStream = fs.createWriteStream(tempFilePath);
        doc.pipe(writeStream);

        // ============ PAGE 1: HEADER & APPOINTMENT DETAILS ============
        // Company Letterhead
        doc
          .image(
            path.join(__dirname, "../../public/img/zeelab-logo.png"),
            50,
            45,
            { width: 120 }
          )
          .fillColor("#333333")
          .fontSize(8)
          .text("Zeelab Pharmacy Pvt. Ltd.", 200, 50, { align: "center" })
          .fontSize(7)
          .text(
            "Registered Office: 5th Floor, Tower B, Unitech Cyber Park",
            200,
            65,
            { align: "center" }
          )
          .text(
            "Sector 39, Gurugram, Haryana 122001 | CIN: U24246HR2019PTC082123",
            200,
            75,
            { align: "center" }
          )
          .moveTo(50, 90)
          .lineTo(550, 90)
          .stroke("#22c55e", 2);

        // Appointment Letter Title
        doc
          .fontSize(16)
          .fillColor("#22c55e")
          .font("Helvetica-Bold")
          .text("LETTER OF APPOINTMENT", 200, 110, { align: "center" })
          .moveDown(1.5);

        // Reference Details
        doc
          .fontSize(10)
          .fillColor("#333333")
          .text(
            `Date: ${new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}`,
            { align: "right" }
          )
          .moveDown(0.5)
          .text(
            `Ref: ZL/APPT/${new Date().getFullYear()}/${Math.floor(
              1000 + Math.random() * 9000
            )}`,
            { align: "right" }
          )
          .moveDown(2);

        // Employee Details
        doc
          .fontSize(10)
          .text(
            `Employee ID: ZL${new Date().getFullYear()}${Math.floor(
              100 + Math.random() * 900
            )}`,
            50,
            180
          )
          .text(`Name: ${user.name}`, 50, 195)
          .text(`Department: ${jobDetails.department}`, 50, 210)
          .text(`Designation: ${jobDetails.title}`, 50, 225)
          .moveDown(2);

        // Salutation
        doc.fontSize(11).text(`Dear ${user.name},`, 50, 250).moveDown(1);

        // Appointment Confirmation
        doc
          .fontSize(11)
          .fillColor("#333333")
          .text(
            `With reference to your application and subsequent discussions, we are pleased to confirm your appointment as ${
              jobDetails.title
            } at Zeelab Pharmacy Pvt. Ltd. (hereinafter referred to as "the Company") effective from ${
              jobDetails.joiningDate || "your date of joining"
            }. This letter along with the Company's policies forms the terms of your employment.`,
            {
              align: "left",
              lineGap: 5,
              width: 500,
            }
          )
          .moveDown(1.5);

        // Key Appointment Terms
        doc
          .font("Helvetica-Bold")
          .text("1. KEY TERMS OF APPOINTMENT:", 50)
          .font("Helvetica")
          .moveDown(0.5)
          .text(
            `• Designation: ${jobDetails.title} (Grade: ${
              jobDetails.grade || "To be specified"
            })`,
            { indent: 30 }
          )
          .text(`• Department: ${jobDetails.department}`, { indent: 30 })
          .text(
            `• Reporting To: ${jobDetails.reportingTo || "To be specified"}`,
            { indent: 30 }
          )
          .text(
            `• Employment Type: ${jobDetails.employmentType || "Permanent"}`,
            { indent: 30 }
          )
          .text(
            `• Work Location: ${
              jobDetails.location || "Corporate Office, Gurugram"
            }`,
            { indent: 30 }
          )
          .text(`• Probation Period: 6 months from date of joining`, {
            indent: 30,
          })
          .moveDown(1.5);

        // ============ PAGE 2: COMPENSATION & BENEFITS ============
        doc.addPage();

        // Compensation Header
        doc
          .font("Helvetica-Bold")
          .text("2. REMUNERATION STRUCTURE:", 50, 50)
          .font("Helvetica")
          .moveDown(0.5);

        // Compensation Details
        const compensationText = [
          `• Annual CTC: ₹${
            jobDetails.ctc || "To be specified"
          } (Cost to Company)`,
          `• Monthly Breakdown:`,
          `   - Basic Salary: ₹${
            Math.round((jobDetails.ctc * 0.5) / 12) || "____"
          } (50% of CTC)`,
          `   - HRA: ₹${
            Math.round((jobDetails.ctc * 0.4) / 12) || "____"
          } (40% of Basic)`,
          `   - Special Allowances: ₹${
            Math.round((jobDetails.ctc * 0.1) / 12) || "____"
          } (10% of Basic)`,
          `• Payment Schedule: 7th of each month via bank transfer`,
          `• Statutory Deductions: PF, ESI, PT, and TDS as applicable`,
          `• Annual Review: Performance-based appraisal and increment`,
        ];

        compensationText.forEach((item) => {
          doc.text(item, { indent: 30 });
        });
        doc.moveDown(1.5);

        // Benefits
        doc
          .font("Helvetica-Bold")
          .text("3. EMPLOYEE BENEFITS:", 50)
          .font("Helvetica")
          .moveDown(0.5)
          .text(
            `As a confirmed employee, you will be eligible for the following benefits:`,
            { indent: 30 }
          )
          .moveDown(0.5);

        const benefitsText = [
          "• Health Insurance: Group medical coverage (self + family) up to ₹5 lakhs",
          "• Leave Entitlement: 18 paid leaves per annum + 12 public holidays",
          "• Gratuity: As per Payment of Gratuity Act, 1972",
          "• Provident Fund: Statutory contribution (12% employer matching)",
          "• Professional Development: Sponsorship for approved certifications",
          "• Employee Discount: 15% discount on pharmacy products",
          "• Wellness Programs: Annual health check-ups and gym membership",
        ];

        benefitsText.forEach((item) => {
          doc.text(item, { indent: 30 });
        });
        doc.moveDown(1.5);

        // ============ PAGE 3: POLICIES & ACCEPTANCE ============
        doc.addPage();

        // Policies Header
        doc
          .font("Helvetica-Bold")
          .text("4. COMPANY POLICIES:", 50, 50)
          .font("Helvetica")
          .moveDown(0.5);

        // Policies Content
        const policiesText = [
          "4.1 You will be governed by all Company policies including but not limited to:",
          "   - Code of Conduct & Business Ethics",
          "   - Information Security Policy",
          "   - Sexual Harassment Prevention Policy",
          "   - Leave and Attendance Policy",
          "   - Internet and Email Usage Policy",
          "",
          "4.2 Confidentiality: You shall maintain strict confidentiality of all Company information.",
          "",
          "4.3 Intellectual Property: All work output during employment shall remain Company property.",
          "",
          "4.4 Termination: Either party may terminate with 30 days notice after probation.",
          "",
          "4.5 Conflict of Interest: Must disclose any external engagements that may conflict with Company interests.",
          "",
          "4.6 Amendments: Company reserves the right to modify terms with written notice.",
        ];

        policiesText.forEach((item) => {
          doc.text(item, { indent: 20 });
        });
        doc.moveDown(2);

        // Declaration
        doc
          .font("Helvetica-Bold")
          .text("EMPLOYEE DECLARATION:", 50)
          .font("Helvetica")
          .moveDown(0.5)
          .text(
            "I hereby accept the terms of employment outlined in this letter and agree to abide by all Company policies and procedures. I confirm that all information provided during the hiring process is true and accurate to the best of my knowledge.",
            {
              lineGap: 5,
              width: 500,
            }
          )
          .moveDown(3);

        // Signature Blocks
        doc
          .text("For Zeelab Pharmacy Pvt. Ltd.", 100, undefined)
          .moveDown(3)
          .text("___________________________", 100, undefined)
          .text("Authorized Signatory", 100, undefined)
          .text("Director/HR Head", 100, undefined)
          .text("Date: ___________", 100, undefined)
          .moveDown(1)
          .text("Employee Acknowledgment", 350, undefined)
          .moveDown(3)
          .text("___________________________", 350, undefined)
          .text("Signature", 350, undefined)
          .text("Full Name: ${user.name}", 350, undefined)
          .text("Date: ___________", 350, undefined)
          .text("Employee ID: ___________", 350, undefined);

        // Footer
        doc
          .fontSize(8)
          .fillColor("#666666")
          .text(
            "This appointment is subject to satisfactory background verification and document submission",
            200,
            750,
            { align: "center" }
          )
          .text(
            "Confidential Document - Property of Zeelab Pharmacy Pvt. Ltd.",
            200,
            765,
            { align: "center" }
          );

        // Finalize PDF
        doc.end();

        // Wait for PDF creation
        await new Promise((resolve, reject) => {
          writeStream.on("finish", resolve);
          writeStream.on("error", reject);
        });

        // Send professional appointment email
        const mailOptions = {
          from: `Zeelab Pharmacy HR <${EmailConfig.mailFromAddress}>`,
          to: user.email,
          cc: ["hr@zeelabpharmacy.com", jobDetails.reportingManagerEmail || ""],
          subject: `Your Appointment Letter - ${jobDetails.title} | Zeelab Pharmacy`,
          html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; }
                .header { background-color: #22c55e; padding: 30px 20px; text-align: center; }
                .logo { height: 60px; }
                .content { padding: 30px 20px; }
                .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
                h1 { color: #22c55e; font-size: 24px; margin-bottom: 25px; }
                p { margin-bottom: 15px; }
                .highlight-box { background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; }
                .signature { margin-top: 30px; font-style: italic; color: #555; }
                .steps { counter-reset: step; margin-left: 20px; }
                .steps li { margin-bottom: 10px; position: relative; list-style: none; }
                .steps li:before { 
                    content: counter(step); counter-increment: step; 
                    background: #22c55e; color: white; 
                    width: 24px; height: 24px; border-radius: 50%;
                    display: inline-block; text-align: center; 
                    margin-right: 10px; position: absolute; left: -30px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="https://zeelabpharmacy.com/img/logo.png" alt="Zeelab Pharmacy" class="logo">
            </div>
            
            <div class="content">
                <h1>Welcome to Zeelab Pharmacy!</h1>
                
                <p>Dear ${user.name},</p>
                
                <p>We are pleased to confirm your appointment as <strong>${
                  jobDetails.title
                }</strong> in our ${
            jobDetails.department
          } department, effective ${
            jobDetails.joiningDate || "upon joining"
          }.</p>
                
                <div class="highlight-box">
                    <p>Your official <strong>Appointment Letter</strong> and <strong>Employee Handbook</strong> are attached for your reference. These documents contain important information about your employment terms, benefits, and company policies.</p>
                </div>
                
                <p><strong>Please complete these steps:</strong></p>
                <ol class="steps">
                    <li>Review all attached documents carefully</li>
                    <li>Sign and return the appointment letter within 3 working days</li>
                    <li>Submit required documents (listed in the onboarding checklist)</li>
                    <li>Complete pre-joining formalities if any</li>
                </ol>
                
                <p>Our HR team will contact you shortly to guide you through the onboarding process. For any queries, please contact hr@zeelabpharmacy.com or call +91-124-4123456.</p>
                
                <div class="signature">
                    <p>Warm regards,</p>
                    <p><strong>People Operations Team</strong><br>
                    Zeelab Pharmacy Pvt. Ltd.<br>
                    <a href="https://zeelabpharmacy.com">www.zeelabpharmacy.com</a></p>
                </div>
            </div>
            
            <div class="footer">
                <p>This is a system-generated email. Please do not reply directly to this message.</p>
                <p>© ${new Date().getFullYear()} Zeelab Pharmacy Pvt. Ltd. All rights reserved.</p>
            </div>
        </body>
        </html>
        `,
          attachments: [
            {
              filename: `Zeelab_Appointment_Letter_${user.name.replace(
                /\s+/g,
                "_"
              )}.pdf`,
              path: tempFilePath,
            },
            // Could add employee handbook PDF if available
          ],
        };

        const emailResult = await sendEmail(mailOptions);

        if (!emailResult.success) {
          throw new Error(emailResult.error?.message || "Failed to send email");
        }

        // Update records
        ApplicationDetails.Letters.push({
          type: "appointment",
          sentAt: new Date(),
          recipient: user.email,
          templateUsed: template._id,
          documentPath: tempFilePath,
          reference: `ZL/APPT/${new Date().getFullYear()}/${Math.floor(
            1000 + Math.random() * 9000
          )}`,
          effectiveDate: jobDetails.joiningDate,
        });
        await ApplicationDetails.save();
      }

      res.json({
        success: true,
        message: "Letter generated and sent successfully",
        data: ApplicationDetails,
      });
    } catch (error) {
      console.error("Error generating letter:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate and send letter",
        error: error.message,
      });
    } finally {
      // Clean up temp file if it exists
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (cleanupError) {
          console.error("Error cleaning up temp file:", cleanupError);
        }
      }
    }
  },
};

module.exports = letterTemplateController;
