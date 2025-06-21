import React, { memo, useState } from "react";
import { Form, Input, Select, Divider, Spin, Button } from "antd";
import { useQuery } from "@tanstack/react-query";
import { fetchCompanyBankAccounts } from "../../../api/auth";

const { Option } = Select;

const SalaryDetails = memo(() => {
  const [showMore, setShowMore] = useState(false);

  const {
    data: bankAccounts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["companyBankAccounts"],
    queryFn: fetchCompanyBankAccounts,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="p-4">
      <Divider orientation="left">Salary Information</Divider>

      <Form.Item
        name={["salary", "basicSalary"]}
        label="Basic Salary"
        rules={[{ required: true, message: "Please input basic salary!" }]}
      >
        <Input type="number" placeholder="Basic Salary" />
      </Form.Item>
      <Form.Item name={["salary", "hra"]} label="HRA">
        <Input type="number" placeholder="HRA" />
      </Form.Item>
      <Form.Item name={["salary", "conveyance"]} label="Conveyance">
        <Input type="number" placeholder="Conveyance" />
      </Form.Item>
      <Form.Item name={["salary", "medical"]} label="Medical">
        <Input type="number" placeholder="Medical" />
      </Form.Item>
      <Form.Item name={["salary", "otherAllow"]} label="Other Allowances">
        <Input type="number" placeholder="Other Allowances" />
      </Form.Item>

      <Form.Item
        name={["salary", "paymentFrequency"]}
        label="Payment Frequency"
        rules={[{ required: true, message: "Please select payment frequency!" }]}
      >
        <Select placeholder="Select Payment Frequency">
          <Option value="monthly">Monthly</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name={["salary", "bankAccount"]}
        label="Bank Account for Salary"
        rules={[{ required: true, message: "Please select a bank account!" }]}
      >
        <Select
          placeholder="Select Account For Paying this user"
          loading={isLoading}
          notFoundContent={
            isError ? (
              "Failed to load accounts"
            ) : isLoading ? (
              <Spin size="small" />
            ) : (
              "No accounts found"
            )
          }
        >
          {bankAccounts?.map((account) => (
            <Option key={account._id} value={account._id}>
              {account.accountHolder} - {account.accountNumber} (
              {account.accountType})
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Show More Button */}
      <div className="text-right mb-4">
        <Button type="link" onClick={() => setShowMore(!showMore)}>
          {showMore ? "Hide Deductions" : "Show More Fields"}
        </Button>
      </div>

      {/* Deductions Section */}
      {showMore && (
       <>
  <Divider orientation="right"> Deductions </Divider>
  <p className="border-t mb-2">For Office Use Only*</p>

  <Form.Item
    name={["salary", "vpf"]}
    label="VPF"
    initialValue={0}
  >
    <Input type="number" placeholder="VPF" readOnly/>
  </Form.Item>

  <Form.Item
    name={["salary", "pf"]}
    label="PF"
    initialValue={0}
  >
    <Input type="number" placeholder="PF" readOnly />
  </Form.Item>

  <Form.Item
    name={["salary", "esi"]}
    label="ESI"
    initialValue={0}
  >
    <Input type="number" placeholder="ESI" readOnly />
  </Form.Item>

  <Form.Item
    name={["salary", "lpd"]}
    label="LPD"
    initialValue={0}
  >
    <Input type="number" placeholder="LPD" readOnly />
  </Form.Item>

  <Form.Item
    name={["salary", "tds"]}
    label="TDS"
    initialValue={0}
  >
    <Input type="number" placeholder="TDS" readOnly />
  </Form.Item>

  <Form.Item
    name={["salary", "lwf"]}
    label="LWF"
    initialValue={0}
  >
    <Input type="number" placeholder="LWF" readOnly />
  </Form.Item>

  <Form.Item
    name={["salary", "otherDeduction"]}
    label="Other Deduction"
    initialValue={0}
  >
    <Input type="number" placeholder="Other Deduction" readOnly />
  </Form.Item>

  <Form.Item
    name={["salary", "advancePay"]}
    label="Advance Pay"
    initialValue={0}
  >
    <Input type="number" placeholder="Advance Pay" readOnly />
  </Form.Item>
</>

      )}
    </div>
  );
});

export default memo(SalaryDetails);
