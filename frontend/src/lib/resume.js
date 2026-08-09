const CLOUDINARY_DELIVERY_HOST = "res.cloudinary.com";
const CLOUDINARY_UPLOAD_SEGMENT = "/upload/";
const CLOUDINARY_ATTACHMENT_SEGMENT = "/upload/fl_attachment/";

export const getResumeDownloadUrl = (resumeUrl) => {
  if (!resumeUrl) return "";

  try {
    const url = new URL(resumeUrl);

    if (
      url.hostname !== CLOUDINARY_DELIVERY_HOST ||
      !url.pathname.includes(CLOUDINARY_UPLOAD_SEGMENT) ||
      url.pathname.includes(CLOUDINARY_ATTACHMENT_SEGMENT)
    ) {
      return resumeUrl;
    }

    url.pathname = url.pathname.replace(
      CLOUDINARY_UPLOAD_SEGMENT,
      CLOUDINARY_ATTACHMENT_SEGMENT,
    );

    return url.toString();
  } catch {
    return resumeUrl;
  }
};
