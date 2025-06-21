import { settingsSections } from "../data/SystemSetting";

const SectionRenderer = () => {
  return (
    <>
      {settingsSections.map(({ key, Component }) => (
        <div id={key} key={key} className="mb-12 scroll-mt-20">
          <Component />
        </div>
      ))}
    </>
  );
};

export default SectionRenderer;
