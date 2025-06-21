import { useLocation } from "react-router-dom";
import HrmsTabHeader from "../../Tab/HrmsTabHeader";
import BranchCreate from "./Branch";

function Setup() {
  const { search } = useLocation();
  const type = new URLSearchParams(search).get("type") || "default";

  const componentMap = {
    branch: <BranchCreate />,
    default: (
      <div className="text-white text-xl font-semibold p-4">
        Setup and manage your HRMS modules
      </div>
    ),
  };

  const component = componentMap[type] || componentMap.default;

  return (
    <div
    
      className="h-[92vh] overflow-y-auto p-1 w-full"
    >
      {/* Optional header */}
      <HrmsTabHeader />
      {component}
     
    </div>
  );
}

export default Setup;
