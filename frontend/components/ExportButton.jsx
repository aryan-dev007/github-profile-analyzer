import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const DEFAULT_FILENAME = "github-profile-report.pdf";

export default function ExportButton({ targetRef, filename }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      if (!targetRef?.current) {
        alert("Nothing to export");
        return;
      }

      if (isExporting) return;
      setIsExporting(true);

      const element = targetRef.current;
      const originalBackground = element.style.background;
      element.style.background = "#ffffff";
      element.classList.add("pdf-export-mode");

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff"
      });

      element.classList.remove("pdf-export-mode");
      element.style.background = originalBackground;

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pageHeightPx = (canvas.width * pageHeight) / pageWidth;
      let remainingHeight = canvas.height;
      let sourceY = 0;

      const tempCanvas = document.createElement("canvas");
      const tempContext = tempCanvas.getContext("2d");
      tempCanvas.width = canvas.width;

      let isFirstPage = true;
      while (remainingHeight > 0) {
        const sliceHeight = Math.min(pageHeightPx, remainingHeight);
        tempCanvas.height = sliceHeight;
        tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempContext.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );

        const imgData = tempCanvas.toDataURL("image/png");
        if (!isFirstPage) {
          pdf.addPage();
        }

        const sliceImgHeight = (sliceHeight * imgWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, sliceImgHeight);

        isFirstPage = false;
        remainingHeight -= sliceHeight;
        sourceY += sliceHeight;
      }

      pdf.save(filename || DEFAULT_FILENAME);
    } catch (error) {
      console.error(error);
      alert(`Failed to export PDF: ${error?.message || "Unknown error"}`);
    } finally {
      if (targetRef?.current) {
        targetRef.current.classList.remove("pdf-export-mode");
      }
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isExporting ? "Exporting..." : "Export Report"}
    </button>
  );
}
