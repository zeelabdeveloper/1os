import React, { useRef, useState, useEffect } from "react";
import { Menu } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { settingsSections } from "../data/SystemSetting";
import SectionRenderer from "../Tab/SectionRenderer";

const SettingsPanel = () => {
  const [activeTab, setActiveTab] = useState(settingsSections[0].key);
  const contentRef = useRef();

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el && contentRef.current) {
      contentRef.current.scrollTo({
        top: el.offsetTop - 60,
        behavior: "smooth",
      });
    }
  };

  const updateURLHash = (key) => {
    history.replaceState(null, "", `#${key}`);
  };

  useEffect(() => {
    const handleScroll = () => {
      const offsets = settingsSections
        .map(({ key }) => {
          const el = document.getElementById(key);
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          return { key, top: rect.top };
        })
        .filter(Boolean);

      const current = offsets.find((o) => o.top >= 0 && o.top < 300);
      if (current) {
        setActiveTab(current.key);
        updateURLHash(current.key);
      }
    };

    const container = contentRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

  // On initial load or URL hash change
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      scrollToSection(hash);
      setActiveTab(hash);
    }

    const onHashChange = () => {
      const key = window.location.hash.replace("#", "");
      if (key) {
        scrollToSection(key);
        setActiveTab(key);
      }
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="w-full flex h-[92vh] bg-white">
      {/* Sidebar */}
      <div className="w-[260px] h-[92vh] overflow-y-auto py-2  shadow-lg    ">
        <div className="p-4 font-bold text-center text-green-600   text-xl ">
          Controller
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={({ key }) => {
            scrollToSection(key);
            updateURLHash(key);
          }}
          className="pt-2"
        >
          {settingsSections.map(({ key, label, icon }) => (
            <Menu.Item key={key} icon={icon}>
              <div className="flex justify-between items-center">
                <span className="text-[12px]">{label}</span>
                <RightOutlined className="text-xs text-gray-400" />
              </div>
            </Menu.Item>
          ))}
        </Menu>
      </div>

      {/* Right Content */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto p-6 bg-gray-50 scroll-smooth"
      >
        <SectionRenderer />
      </div>
    </div>
  );
};

export default SettingsPanel;
