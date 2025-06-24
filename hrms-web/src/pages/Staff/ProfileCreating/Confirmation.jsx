import React from "react";
import { Result, Button, Spin } from "antd";
import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useNavigation } from "react-router-dom";

const ConfirmationStatus = ({ isSuccess , data }) => {
  console.log(data);
  if (!isSuccess) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }
  const navigation = useNavigate();
  const config = isSuccess
    ? {
        icon: (
          <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 60 }} />
        ),
        title: "Successfully Submitted!",
        subTitle:
          data?.message || "You will receive a confirmation email shortly.",
      }
    : {
        icon: (
          <CloseCircleTwoTone twoToneColor="#ff4d4f" style={{ fontSize: 60 }} />
        ),
        title: "Something went Wrong",
        subTitle: data?.message || "Something went wrong. Please try again.",
      };

  return (
    <AnimatePresence>
      <motion.div
        key={isSuccess ? "success" : "error"}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4 }}
        className="mt-10"
      >
        <Result
          icon={config.icon}
          title={config.title}
          subTitle={config.subTitle}
          className="max-w-xl mx-auto bg-white p-6 rounded-md shadow"
          extra={
            isSuccess && data?.data?._id && (
              <Button
                onClick={() => navigation(`/staff/employee?emp=${data?.data?._id}`)}
                type="primary"
              >
                View Staff Details
              </Button>
            )
          }
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmationStatus;
