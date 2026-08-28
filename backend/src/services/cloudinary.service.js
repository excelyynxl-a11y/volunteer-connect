import { randomUUID } from "node:crypto";

import cloudinary from "../lib/cloudinary.js";
import {
  getAttachmentResourceType,
  getSafeDownloadName,
} from "../lib/messageAttachment.js";

export const uploadAvatarToCloudinary = async (fileBuffer) => {
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "avatars",
        resource_type: "image",
        public_id: `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    stream.end(fileBuffer);
  });

  return result.secure_url;
};

export const uploadMessageAttachmentToCloudinary = async (file) => {
  const resourceType = getAttachmentResourceType(file.mimetype);
  const safeFileName = getSafeDownloadName(file.originalname);
  const publicId =
    resourceType === "raw"
      ? `${Date.now()}-${randomUUID()}-${safeFileName}`
      : `${Date.now()}-${randomUUID()}`;

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "message-attachments",
        public_id: publicId,
        resource_type: resourceType,
      },
      (error, uploadResult) => {
        if (error) {
          reject(error);
        } else {
          resolve(uploadResult);
        }
      },
    );

    stream.end(file.buffer);
  });

  return {
    fileName: safeFileName,
    publicId: result.public_id,
    resourceType,
    mimeType: file.mimetype,
    size: file.size,
  };
};

export const deleteMessageAttachmentFromCloudinary = async ({
  publicId,
  resourceType,
}) =>
  cloudinary.uploader.destroy(publicId, {
    invalidate: true,
    resource_type: resourceType,
  });

export const getMessageAttachmentDownloadUrl = (attachment) =>
  cloudinary.url(attachment.publicId, {
    flags: "attachment",
    resource_type: attachment.resourceType,
    secure: true,
    type: "upload",
  });

export const downloadMessageAttachmentFromCloudinary = async (attachment) => {
  const response = await fetch(getMessageAttachmentDownloadUrl(attachment));

  if (!response.ok) {
    throw new Error(`Cloudinary attachment download failed (${response.status})`);
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get("content-type") || attachment.mimeType,
  };
};
