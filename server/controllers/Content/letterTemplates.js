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
        console.log(applicationId)
        if (!applicationId) {
            return res.status(400).json({ 
                success: false, 
                message: "Application ID is required" 
            });
        }

        const onboarding = await Onboarding.findOne({ 
            applicationId 
        }).populate({
            path: 'Letters.templateUsed',
            model: 'LetterTemplate',
            select: 'name type content'
        });

        if (!onboarding) {
            return res.status(404).json({ 
                success: false, 
                message: "Onboarding record not found" 
            });
        }

        // Format the response data
        const letters = onboarding.Letters.map(letter => ({
            _id: letter._id,
            type: letter.type,
            templateName: letter.templateUsed?.name || 'Unknown Template',
            templateContent: letter.templateUsed?.content || '',
            sentAt: letter.sentAt,
            recipient: letter.recipient,
            downloadUrl: `/api/v1/letters/download/${letter._id}`  
        }));

        res.json({
            success: true,
            data: letters
        });
    } catch (error) {
        console.error('Error fetching letters:', error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
} 
,







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
          message: "Template ID and Application ID are required"
        });
      }

      // Create temp directory if it doesn't exist
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Find template
      const template = await LetterTemplate.findById(req.body.templateId);
      if (!template) {
        return res.status(404).json({ 
          success: false, 
          message: "Template not found" 
        });
      }

      // Find application details
      const ApplicationDetails = await Onboarding.findOne({
        applicationId: req.body.applicationId
      }).populate("applicationId");

      if (!ApplicationDetails) {
        return res.status(404).json({ 
          success: false, 
          message: "Application not found" 
        });
      }

      const user = ApplicationDetails.applicationId;
      const jobDetails = await job.findById(user.jobId);

      if (!jobDetails) {
        return res.status(404).json({ 
          success: false, 
          message: "Job details not found" 
        });
      }

      // Handle different letter types
      if (template.type === "offer") {
        // Generate PDF
        const doc = new PDFDocument({
          size: "A4",
          margin: 50,
          layout: "portrait",
          info: {
            Title: `Offer Letter - ${user.name}`,
            Author: "Zeelab Pharmacy HR",
          },
        });

        // Create temp file path
        tempFilePath = path.join(tempDir, `offer_${user._id}_${Date.now()}.pdf`);
        const writeStream = fs.createWriteStream(tempFilePath);
        doc.pipe(writeStream);

        // PDF content
        doc
          .image(path.join(__dirname, "../../public/img/zeelab-logo.png"), 50, 45, { width: 100 })
          .fillColor("#444444")
          .fontSize(20)
          .text("OFFER LETTER", 200, 50, { align: "center" })
          .fontSize(10)
          .text("Zeelab Pharmacy Pvt. Ltd.", 200, 80, { align: "center" })
          .moveDown();

        doc
          .fontSize(10)
          .text(`Date: ${new Date().toLocaleDateString("en-IN")}`, { align: "right" })
          .moveDown();

        doc
          .fontSize(12)
          .text(`Dear ${user.name},`, { align: "left" })
          .moveDown(0.5)
          .text("We are pleased to offer you the position of:")
          .font("Helvetica-Bold")
          .text(jobDetails.title, { indent: 30 })
          .font("Helvetica")
          .moveDown();

        doc
          .text("The terms of your employment are as follows:")
          .moveDown(0.5)
          .text(`• Position: ${jobDetails.title}`, { indent: 30 })
          .text(`• Department: ${jobDetails.department}`, { indent: 30 })
          .text(`• Joining Date: To be discussed`, { indent: 30 })
          .text(`• Compensation: As per discussion`, { indent: 30 })
          .moveDown();

        doc
          .text("This offer is contingent upon:")
          .moveDown(0.5)
          .text("1. Successful completion of background verification", { indent: 30 })
          .text("2. Submission of required documents", { indent: 30 })
          .text("3. Compliance with company policies", { indent: 30 })
          .moveDown();

        doc
          .text("We look forward to having you as part of our team. Please sign and return a copy of this letter to acknowledge your acceptance.")
          .moveDown(2)
          .text("Sincerely,")
          .moveDown(2)
          .text("___________________________")
          .text("HR Manager")
          .text("Zeelab Pharmacy Pvt. Ltd.")
          .moveDown()
          .text("Candidate Acceptance:")
          .moveDown(2)
          .text("___________________________")
          .text("Signature")
          .text("Date: ___________");

        // Finalize PDF
        doc.end();

        // Wait for PDF to be created
        await new Promise((resolve, reject) => {
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
        });

        // Send email
        const mailOptions = {
          from: `"Zeelab Pharmacy HR" <${EmailConfig.mailFromAddress}>`,
          to: user.email,
          subject: `Offer Letter for ${jobDetails.title} Position`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #22c55e; padding: 20px; text-align: center;">
                <img src="https://zeelabpharmacy.com/img/logo.png" alt="Zeelab Pharmacy" style="height: 50px;">
              </div>
              <div style="padding: 20px;">
                <h2 style="color: #22c55e;">Congratulations, ${user.name}!</h2>
                <p>We are pleased to extend an offer for the position of <strong>${jobDetails.title}</strong> at Zeelab Pharmacy.</p>
                <p>Please find your official offer letter attached with this email.</p>
                <p>To accept this offer, please reply to this email or sign and return the attached document.</p>
                <p>We look forward to welcoming you to our team!</p>
                <br/>
                <p>Best regards,<br/>
                <strong>HR Team</strong><br/>
                Zeelab Pharmacy Pvt. Ltd.</p>
              </div>
              <div style="background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 12px;">
                <p>This is an automated email. Please do not reply directly to this message.</p>
              </div>
            </div>
          `,
          attachments: [
            {
              filename: `Zeelab_Offer_Letter_${user.name.replace(/\s+/g, '_')}.pdf`,
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
        });
        await ApplicationDetails.save();
      }

      res.json({
        success: true,
        message: "Letter generated and sent successfully",
        data: ApplicationDetails
      });
    } catch (error) {
      console.error('Error generating letter:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to generate and send letter",
        error: error.message 
      });
    } finally {
      // Clean up temp file if it exists
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (cleanupError) {
          console.error('Error cleaning up temp file:', cleanupError);
        }
      }
    }
  }













};

module.exports = letterTemplateController;
