import { Cancel, Delete, Edit, Image } from "@mui/icons-material";
import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import axios from "axios";
import { Modal } from "@mui/material";

const AdminFoodList = ({ item }) => {
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [cost, setCost] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  // Populate fields when modal opens
  useEffect(() => {
    if (openModal && item) {
      setName(item.name || "");
      setCategory(item.category || "");
      setCost(item.cost !== undefined ? String(item.cost) : "");
      setDescription(item.description || "");
      setSelectedImage(null);
    }
  }, [openModal, item]);

  const getAuthHeader = () => {
    // token might be stored as raw string or JSON stringified
    let token = window.localStorage.getItem("token");
    try {
      // if token was stored as JSON.stringify("value"), JSON.parse returns the string value
      token = token ? JSON.parse(token) : token;
    } catch (e) {
      // not JSON - keep raw token
    }
    if (!token) return null;
    return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  };

  const handleDelete = async () => {
    const authHeader = getAuthHeader();
    if (!authHeader) {
      enqueueSnackbar("Not authenticated", { variant: "error" });
      return;
    }

    try {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/food/${item._id}`,
        { headers: { Authorization: authHeader } }
      );
      enqueueSnackbar(data.message || "Deleted", {
        variant: "success",
        autoHideDuration: 3000,
      });
      // refresh or call parent callback
      window.location.reload();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to delete";
      enqueueSnackbar(msg, { variant: "error", autoHideDuration: 3000 });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const authHeader = getAuthHeader();
    if (!authHeader) {
      enqueueSnackbar("Not authenticated", { variant: "error" });
      return;
    }

    try {
      let imageUrl = item.image; // default to existing image

      // If a new image is selected, upload to Cloudinary
      if (selectedImage) {
        const formData = new FormData();
        formData.append("file", selectedImage);
        formData.append(
          "upload_preset",
          `${process.env.NEXT_PUBLIC_UPLOAD_PRESET}`
        );
        formData.append("cloud_name", `${process.env.NEXT_PUBLIC_CLOUD_NAME}`);

        const res = await fetch(`${process.env.NEXT_PUBLIC_CLOUDINARY_API}`, {
          method: "POST",
          body: formData,
        });

        const cloudData = await res.json();

        if (!res.ok) {
          throw new Error(
            cloudData?.error?.message || "Image upload failed to Cloudinary"
          );
        }
        imageUrl = cloudData.secure_url;
      }

      // If your backend expects cost as number, convert
      const payload = {
        name,
        category,
        cost: isNaN(Number(cost)) ? cost : Number(cost),
        description,
        image: imageUrl,
      };

      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/food/${item._id}`,
        payload,
        { headers: { Authorization: authHeader } }
      );

      enqueueSnackbar(data.message || "Updated", {
        variant: "success",
        autoHideDuration: 3000,
      });

      setOpenModal(false);
      window.location.reload(); // or call parent's update callback if provided
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to update";
      enqueueSnackbar(msg, { variant: "error", autoHideDuration: 3000 });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center p-3 bg-gray-600 w-[18rem] md:w-[20rem] lg:w-[25rem]  rounded-xl mb-3">
        <h1 className="text-green-100 font-semibold">{item.name}</h1>
        <div>
          <Edit
            onClick={() => setOpenModal(true)}
            className="text-green-400 cursor-pointer"
          />
          <Delete
            onClick={handleDelete}
            className="text-green-400 ml-3 cursor-pointer"
          />
          <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <div className="h-full w-full md:h-[600px] md:w-[450px] border-none rounded-lg outline-none bg-gray-700 absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2">
              <div className="flex flex-col items-center relative justify-center h-full">
                <form
                  className="flex flex-col items-center justify-center w-11/12"
                  onSubmit={handleUpdate}
                >
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="p-3 border-2 border-green-400 mt-3 bg-transparent rounded-lg outline-none font-semibold placeholder:text-sm w-full"
                    type="text"
                    placeholder="Food name"
                    required
                  />
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="p-3 border-2 border-green-400 mt-3 bg-transparent rounded-lg outline-none font-semibold placeholder:text-sm w-full"
                    type="text"
                    placeholder="Category"
                    required
                  />
                  <input
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="p-3 border-2 border-green-400 mt-3 bg-transparent rounded-lg outline-none font-semibold placeholder:text-sm w-full"
                    type="text"
                    placeholder="Price"
                    required
                  />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="p-3 border-2 border-green-400 mt-3 bg-transparent rounded-lg outline-none font-semibold placeholder:text-sm w-full"
                    placeholder="Description"
                    rows={4}
                    required
                  />
                  <div className="flex items-center justify-between mt-3 w-full">
                    <label htmlFor={`image-${item._id}`} className="flex items-center">
                      <Image className="text-green-500 text-3xl cursor-pointer" />
                      <h1 className="text-white text-sm font-semibold ml-2">
                        {selectedImage?.name || "No file chosen"}
                      </h1>
                    </label>
                    <input
                      id={`image-${item._id}`}
                      type="file"
                      onChange={(e) => setSelectedImage(e.target.files[0])}
                      className="opacity-0 w-12"
                    />
                  </div>
                  <input
                    type="submit"
                    value={"Update"}
                    className="bg-white text-green-500 font-bold p-3 outline-none rounded-lg w-full cursor-pointer mt-3 hover:bg-green-400 hover:text-white transition duration-300 ease-in"
                  />
                </form>
                <div className="absolute top-2 left-2 flex justify-center items-center bg-gray-700 h-10 w-10 rounded-full cursor-pointer">
                  <Cancel
                    className="text-3xl"
                    onClick={() => setOpenModal(false)}
                  />
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default AdminFoodList;
