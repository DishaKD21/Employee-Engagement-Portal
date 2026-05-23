"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Loader from "@/components/ui/Loader";
import SectionHeader from "@/modules/employee/components/SectionHeader";
import { useEmployeeProfileData, updateEmployeeProfileData } from "@/modules/employee/hooks/useEmployeeData";

const editableFields = ["name", "department", "location", "language", "timeZone"];

export default function EmployeeProfileView() {
  const { data, loading, error, refetch } = useEmployeeProfileData();
  const [formValues, setFormValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = editableFields.reduce((acc, field) => {
        if (formValues[field]?.trim()) acc[field] = formValues[field].trim();
        return acc;
      }, {});

      await updateEmployeeProfileData(payload);
      await refetch();
      setMessage("Profile updated successfully.");
    } catch (submitError) {
      setMessage(submitError?.response?.data?.message || submitError?.message || "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading profile" />;
  if (error) return <EmptyState title="Unable to load profile" description={error} />;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Employee profile"
        title="Update your employee information"
        description="Changes are saved directly through the backend `PATCH /api/v1/employees/me` endpoint."
      />

      <Card title="Profile summary" subtitle={data?.email || "Account"}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <p className="text-sm text-slate-300"><span className="text-slate-500">Name:</span> {data?.name || "—"}</p>
          <p className="text-sm text-slate-300"><span className="text-slate-500">Department:</span> {data?.department || "—"}</p>
          <p className="text-sm text-slate-300"><span className="text-slate-500">Location:</span> {data?.location || "—"}</p>
          <p className="text-sm text-slate-300"><span className="text-slate-500">Language:</span> {data?.language || "—"}</p>
          <p className="text-sm text-slate-300"><span className="text-slate-500">Time zone:</span> {data?.timeZone || "—"}</p>
        </div>
      </Card>

      <Card title="Edit profile">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <Input name="name" label="Name" value={formValues.name ?? data?.name ?? ""} onChange={onChange} />
          <Input name="department" label="Department" value={formValues.department ?? data?.department ?? ""} onChange={onChange} />
          <Input name="location" label="Location" value={formValues.location ?? data?.location ?? ""} onChange={onChange} />
          <Input name="language" label="Language" value={formValues.language ?? data?.language ?? ""} onChange={onChange} />
          <Input name="timeZone" label="Time zone" value={formValues.timeZone ?? data?.timeZone ?? ""} onChange={onChange} />

          <div className="md:col-span-2 flex items-center gap-4">
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
            {message ? <p className="text-sm text-slate-400">{message}</p> : null}
          </div>
        </form>
      </Card>
    </div>
  );
}
