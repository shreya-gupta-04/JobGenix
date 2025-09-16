import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { setUser } from "@/redux/authSlice";
import { toast } from "sonner";

const UpdateProfileDialog = ({ open, setOpen }) => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  // Initialize state with safe defaults
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    fullname: user?.fullname ?? "",
    email: user?.email ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    bio: user?.profile?.bio ?? "",
    // keep skills as a comma-separated string in the input
    skills: Array.isArray(user?.profile?.skills) ? user.profile.skills.join(", ") : (user?.profile?.skills ?? ""),
    file: null, // file object (resume) will go here
  });

  // If user changes externally (e.g. after update) sync basic fields
  useEffect(() => {
    setInput((prev) => ({
      ...prev,
      fullname: user?.fullname ?? prev.fullname,
      email: user?.email ?? prev.email,
      phoneNumber: user?.phoneNumber ?? prev.phoneNumber,
      bio: user?.profile?.bio ?? prev.bio,
      skills: Array.isArray(user?.profile?.skills) ? user.profile.skills.join(", ") : (user?.profile?.skills ?? prev.skills)
    }));
  }, [user]);

  // handle text inputs (name attribute must match the key in state)
  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    setInput((s) => ({ ...s, [name]: value }));
  };

  // file input handler
  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0] ?? null;
    setInput((s) => ({ ...s, file }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("fullname", input.fullname);
      formData.append("email", input.email);
      formData.append("phoneNumber", input.phoneNumber);
      formData.append("bio", input.bio);

      // backend: accept skills as comma separated or handle accordingly
      // if your backend expects an array, you can send JSON string:
      // formData.append("skills", JSON.stringify(input.skills.split(",").map(s => s.trim())));
      formData.append("skills", input.skills);

      // append file (field name "file" matches your multer.single("file"))
      if (input.file) formData.append("file", input.file);

      // Do NOT set Content-Type header; axios will set the proper multipart boundary
      const res = await axios.post(`${USER_API_END_POINT}/profile/update`, formData, {
        withCredentials: true,
      });

      if (res?.data?.success) {
        // update redux store with returned user
        dispatch(setUser(res.data.user));
        toast.success(res.data.message ?? "Profile updated");
        setOpen(false);
      } else {
        // server responded but success:false
        toast.error(res?.data?.message ?? "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update failed:", err);
      const msg = err?.response?.data?.message ?? err.message ?? "Network error";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog open={open}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle>Update Profile</DialogTitle>
          </DialogHeader>

          <form onSubmit={submitHandler}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fullname" className="text-right">Name</Label>
                <Input
                  id="fullname"
                  name="fullname"
                  type="text"
                  value={input.fullname}
                  onChange={changeEventHandler}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={input.email}
                  onChange={changeEventHandler}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phoneNumber" className="text-right">Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="text"
                  value={input.phoneNumber}
                  onChange={changeEventHandler}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bio" className="text-right">Bio</Label>
                <Input
                  id="bio"
                  name="bio"
                  type="text"
                  value={input.bio}
                  onChange={changeEventHandler}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="skills" className="text-right">Skills</Label>
                <Input
                  id="skills"
                  name="skills"
                  type="text"
                  placeholder="comma separated (eg. React, Node)"
                  value={input.skills}
                  onChange={changeEventHandler}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">Resume (PDF)</Label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept="application/pdf"
                  onChange={fileChangeHandler}
                  className="col-span-3"
                />
              </div>
            </div>

            <DialogFooter>
              {loading ? (
                <Button className="w-full my-4">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                </Button>
              ) : (
                <Button type="submit" className="w-full my-4">Update</Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpdateProfileDialog;
