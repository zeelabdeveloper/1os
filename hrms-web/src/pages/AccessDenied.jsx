import { Button, Typography, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { FullLogo, LoginBackground, ZeelabShop1 } from "../locale/local";
import { useMediaQuery } from "react-responsive";

const { Title } = Typography;

const AccessDenied = () => {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery({ minWidth: 992 });

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
    formWrapper: {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      padding: "40px",
      borderRadius: "12px",
      width: isDesktop ? "350px" : "100%",
      maxWidth: "350px",
      boxShadow: "0 8px 32px 0 rgba(34, 197, 94, 0.4)",
      backdropFilter: "blur(10px)",
      zIndex: 2,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
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
              style={{ color: "white", marginBottom: "10px" }}
            >
              Welcome to Zeelab Pharmacy
            </Title>

            <p className="bg-white/70 w-full p-2 rounded-lg text-center text-[#22c55e] font-bold flex items-center justify-center gap-x-2">
              <span className="font-extrabold text-[#7FBF2A]"> Dava</span>
              <span className="font-extrabold text-[#281870]"> Asli</span>
              <span className="font-extrabold text-[#177B9D]"> Dam</span>
              <span className="font-extrabold text-[#7FBF2A]"> Par</span>
            </p>
          </div>
        </div>
      )}

      <div style={styles.formWrapper}>
        <img className="w-[150px] h-[50px] mx-auto" src={FullLogo} alt="Logo" />
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

        <Result
          status="403"
          title="403"
          subTitle="Sorry, you are not authorized to access this page."
          style={{ color: "white" }}
          extra={
            <Button
              type="primary"
              onClick={() => navigate(-1)}
              size="large"
              style={{
                background: "linear-gradient(90deg, #7FBF2A, #281870, #281870)",
                border: "none",
              }}
            >
              Go Back
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default AccessDenied;