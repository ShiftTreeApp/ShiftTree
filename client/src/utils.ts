export function downloadFile({
  data,
  filename,
}: {
  data: Blob;
  filename: string;
}) {
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
