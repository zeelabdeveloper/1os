import React, { useState } from "react";
import { Input, Button, Table, Tooltip, message } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { fetchCVs } from "../api/auth";

const FetchCVList = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");

  const { data, refetch, isFetching, isLoading } = useQuery({
    queryKey: ["cvList", { page, pageSize, search }],
    queryFn: fetchCVs,
    keepPreviousData: true,
  });

  const columns =
    data?.columns?.map((col) => ({
      title: col.charAt(0).toUpperCase() + col.slice(1),
      dataIndex: col,
      key: col,
      render: (text) => text || "N/A",
    })) || [];

  return (
    <>
      <div className="flex overflow-hidden items-center justify-between mb-4">
        <Input
          placeholder="Search by name"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          allowClear
          style={{ maxWidth: 300 }}
        />

        <Button
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          loading={isFetching}
        >
          Refresh
        </Button>
      </div>

      <Table
        columns={columns}
        className="!overflow-x-auto"
        dataSource={data?.data || []}
        loading={isLoading}
        rowKey={(record) => record._id || record.id}
        pagination={{
          current: page,
          pageSize,
          total: data?.total || 0,
          showSizeChanger: true, // ⬅️ This enables pageSize selector
          onChange: (newPage, newPageSize) => {
            setPage(newPage);
            setPageSize(newPageSize);  
          },
        }}
      />
    </>
  );
};

export default FetchCVList;
