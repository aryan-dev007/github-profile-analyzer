import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ExportButton({ targetRef, filename }) {
  const handleExport = async () => {
    if (!targetRef?.current) return;

    const canvas = await html2canvas(targetRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#faf7f2"
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    const usableWidth = pageWidth - margin * 2;
    const ratio = usableWidth / canvas.width;
    const imageHeight = canvas.height * ratio;

    let remainingHeight = imageHeight;
    let position = margin;

    pdf.addImage(imgData, "PNG", margin, position, usableWidth, imageHeight);
    remainingHeight -= pageHeight - margin * 2;

    while (remainingHeight > 0) {
      pdf.addPage();
      position = margin - (imageHeight - remainingHeight);
      pdf.addImage(imgData, "PNG", margin, position, usableWidth, imageHeight);
      remainingHeight -= pageHeight - margin * 2;
    }

    pdf.save(filename || "github-profile-report.pdf");
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
    >
      Export Report (PDF)
    </button>
  );
}
