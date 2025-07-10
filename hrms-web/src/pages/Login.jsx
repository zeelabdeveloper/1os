import { Form, Input, Button, Typography } from "antd";
import { UserOutlined, LockOutlined, KeyOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { loginUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { FullLogo, LoginBackground, ZeelabShop1 } from "../locale/local";

const { Title } = Typography;

const Login = () => {
  const isDesktop = useMediaQuery({ minWidth: 992 });
  console.log("Login");
  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      toast.success(`Welcome to Zeelab Pharmacy!`);
      window.location.href = "/";
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Something went wrong, try again!";
      toast.error(message);
    },
  });

  const onFinish = (values) => {
    mutation.mutate(values);
  };

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundImage: `url(${LoginBackground})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      padding: 20,
      position: "relative",
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgb(0 177 52 / 63%)",
      zIndex: 1,
    },
    sliderContainer: {
      width: "40%",
      minHeight: "60vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "40px",
      marginRight: "40px",
      backgroundColor: "rgba(255, 255, 255, 0.16)",
      borderRadius: "12px",
      boxShadow: "0 8px 32px 0 rgba(34, 197, 94, 0.4)",
      backdropFilter: "blur(10px)",
      zIndex: 2,
    },
    sliderContent: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      color: "white",
      textAlign: "center",
    },
    sliderImage: {
      width: "300px",
      height: "300px",
      objectFit: "cover",
      borderRadius: "50%",
      marginBottom: "20px",
      border: "5px solid #22c55e",
    },
    sliderTitle: {
      color: "white",
      marginBottom: "10px",
    },
    sliderText: {
      color: "white",
      fontSize: "16px",
    },
    formWrapper: {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      padding: "40px",
      borderRadius: "12px",
      width: isDesktop ? "350px" : "100%",
      maxWidth: "350px",
      boxShadow: "0 8px 32px 0 rgba(34, 197, 94, 0.4)",
      backdropFilter: "blur(10px)",
      zIndex: 2,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>

      {isDesktop && (
        <div style={styles.sliderContainer}>
          <div style={styles.sliderContent}>
            <img
              src={ZeelabShop1}
              alt="Zeelab Pharmacy"
              style={styles.sliderImage}
            />
            <Title
              level={3}
              className="font-extrabold"
              style={styles.sliderTitle}
            >
              Welcome to Zeelab Pharmacy
            </Title>

            <p
              className="bg-white/70 w-full p-2 rounded-lg text-center text-[#22c55e] font-bold flex items-center justify-center gap-x-2"
              style={styles.sliderText}
            >
              <span className="   font-extrabold  text-[#7FBF2A]"> Dava</span>
              <span className="   font-extrabold  text-[#281870]"> Asli</span>
              <span className="   font-extrabold  text-[#177B9D]"> Dam</span>
              <span className="   font-extrabold  text-[#7FBF2A]"> Par</span>
            </p>
          </div>
        </div>
      )}

      <div style={styles.formWrapper}>
        <img className="w-[150px] h-[50px] mx-auto" src={FullLogo} />
        <Title
          style={{
            color: "white",
            fontSize: 15,
            textAlign: "center",
            marginBottom: 30,
            marginTop: 10,
          }}
        >
          1OS
        </Title>

        <Form
          name="login"
          autoComplete="on"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
          style={{ width: "100%" }}
        >
          <Form.Item
            name="employeeId"
            label="Employee Id"
            rules={[
              { required: true, message: "Please enter your Employee id!" },
              { type: "text", message: "Enter a valid Employee id!" },
            ]}
          >
            <Input
              autoComplete="employeeId"
              prefix={<UserOutlined style={{ color: "#22c55e" }} />}
              placeholder="Employee Id"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password
              autoComplete="current-password"
              prefix={<LockOutlined style={{ color: "#22c55e" }} />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={mutation.isPending}
              block
              size="large"
              style={{
                background: "linear-gradient(90deg, #7FBF2A, #281870, #281870)",
                border: "none",
              }}
            >
              {mutation.isPending ? "Logging in..." : "Login"}
            </Button>
            <div style={{ textAlign: "left", marginTop: 16 }}>
              <a
                href="/forget-pass"
                style={{
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <KeyOutlined />
                Forgot Password?
              </a>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
