export async function downloadRemoteMedia(url: string, filename = "media") {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("Media download failed:", err);
    window.open(url, "_blank", "noopener,noreferrer");
  }
}