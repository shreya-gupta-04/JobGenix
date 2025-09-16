import React, { useState } from "react";
import Navbar from "./shared/Navbar";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Contact, Mail, Pen } from "lucide-react";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import AppliedJobTable from "./AppliedJobTable";
import UpdateProfileDialog from "./UpdateProfileDialog";
import { useSelector } from "react-redux";
import { useGetAppliedJobs } from "@/hooks/useGetAppliedJobs";

const isResume = true;

const Profile = () => {
  useGetAppliedJobs();
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);

  // defensive defaults
  const profile = user?.profile ?? {};
  const avatarSrc = profile.avatar ?? profile.profilePhoto ?? "https://via.placeholder.com/150";
  // debug: show what Profile actually reads at runtime (remove when done)
  // eslint-disable-next-line no-console
  console.log("PROFILE avatarSrc:", avatarSrc, "user.profile:", profile);

  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const resumeUrl = profile.resume ?? null;
  const resumeOriginalName = profile.resumeOriginalName ?? "";

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl my-5 p-8">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarSrc} alt="profile" />
            </Avatar>
            <div>
              <h1 className="font-medium text-xl">{user?.fullname ?? "—"}</h1>
              <p>{profile.bio ?? ""}</p>
            </div>
          </div>
          <Button onClick={() => setOpen(true)} className="text-right" variant="outline">
            <Pen />
          </Button>
        </div>

        <div className="my-5">
          <div className="flex items-center gap-3 my-2">
            <Mail />
            <span>{user?.email ?? "—"}</span>
          </div>
          <div className="flex items-center gap-3 my-2">
            <Contact />
            <span>{user?.phoneNumber ?? "—"}</span>
          </div>
        </div>

        <div className="my-5">
          <h1>Skills</h1>
          <div className="flex items-center gap-1">
            {skills.length > 0 ? skills.map((item, index) => <Badge key={index}>{item}</Badge>) : <span>NA</span>}
          </div>
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label className="text-md font-bold">Resume</Label>
          {isResume && resumeUrl ? (
            <a target="_blank" rel="noreferrer" href={resumeUrl} className="text-blue-500 w-full hover:underline cursor-pointer">
              {resumeOriginalName || resumeUrl}
            </a>
          ) : (
            <span>NA</span>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl">
        <h1 className="font-bold text-lg my-5">Applied Jobs</h1>
        <AppliedJobTable />
      </div>

      <UpdateProfileDialog open={open} setOpen={setOpen} />
    </div>
  );
};

export default Profile;
