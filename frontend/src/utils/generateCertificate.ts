import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface CertificateProps {
  childName: string;
  vaccineName: string;
  date: string;
  doctorName?: string;
}

export const downloadVaccineCertificate = async ({ childName, vaccineName, date, doctorName = "Dr. Sharma, MD" }: CertificateProps) => {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";

  container.innerHTML = `
    <div id="certificate-content" style="width: 1122px; height: 793px; padding: 40px; background-color: #f6f8f7; font-family: 'Lexend', sans-serif; position: relative; box-sizing: border-box; color: #000;">
      
      <div style="width: 100%; height: 100%; background-color: white; border: 6px solid #10b77f; border-radius: 24px; padding: 60px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); box-sizing: border-box;">

        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.04; z-index: 1;">
          <svg width="400" height="400" viewBox="0 0 24 24" fill="#10b77f"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        </div>

        <div style="position: relative; z-index: 10; display: flex; flex-direction: column; height: 100%;">
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">
             <div style="display: flex; align-items: center; gap: 12px;">
               <div style="width: 54px; height: 54px; background-color: #10b77f; border-radius: 14px; display: flex; justify-content: center; align-items: center; color: white;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
               </div>
               <span style="font-size: 32px; font-weight: 800; color: #0f172a;">WombTo18</span>
             </div>
             <div style="text-align: right;">
               <div style="font-size: 14px; color: #64748b; font-weight: 700; letter-spacing: 1px;">CERTIFICATE NO.</div>
               <div style="font-size: 20px; color: #0f172a; font-weight: 800; font-family: monospace;">WT18-${Math.floor(Math.random() * 1000000)}</div>
             </div>
          </div>

          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 44px; font-weight: 900; color: #0f172a; letter-spacing: 2px; text-transform: uppercase; margin: 0;">Certificate of Immunization</h1>
            <p style="font-size: 18px; color: #10b77f; font-weight: 700; letter-spacing: 5px; text-transform: uppercase; margin-top: 12px;">Official Health Record</p>
          </div>

          <div style="text-align: center; flex-grow: 1;">
            <p style="font-size: 22px; color: #64748b; margin-bottom: 20px;">This document certifies that</p>
            <h2 style="font-size: 56px; font-weight: 800; color: #0f172a; margin: 0 0 30px 0; border-bottom: 3px solid #e2e8f0; display: inline-block; padding-bottom: 10px; min-width: 600px;">${childName}</h2>
            <p style="font-size: 22px; color: #64748b; margin-bottom: 20px;">has been successfully administered the</p>
            <h3 style="font-size: 40px; font-weight: 800; color: #10b77f; margin: 0;">${vaccineName} Vaccine</h3>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; border-top: 2px solid #e2e8f0; padding-top: 40px;">
            <div style="display: flex; gap: 60px;">
              <div>
                <span style="font-size: 13px; color: #64748b; font-weight: 700; display: block; letter-spacing: 1px; margin-bottom: 4px;">DATE ADMINISTERED</span>
                <span style="font-size: 22px; color: #0f172a; font-weight: 800;">${date}</span>
              </div>
              <div>
                <span style="font-size: 13px; color: #64748b; font-weight: 700; display: block; letter-spacing: 1px; margin-bottom: 4px;">AUTHORIZED BY</span>
                <span style="font-size: 22px; color: #0f172a; font-weight: 800;">${doctorName}</span>
              </div>
            </div>

            <div style="text-align: center; position: relative;">
               <div style="width: 110px; height: 110px; border: 4px dashed #10b77f; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto; background-color: #f0fdf4;">
                 <span style="color: #10b77f; font-weight: 900; font-size: 15px; text-transform: uppercase; text-align: center; letter-spacing: 1px;">Verified<br/>Secure</span>
               </div>
               <div style="font-size: 15px; color: #64748b; font-weight: 700;">Authentic Record</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const targetElement = document.getElementById("certificate-content");
    if (!targetElement) throw new Error("Template not found");

    await new Promise((resolve) => setTimeout(resolve, 50));

    const canvas = await html2canvas(targetElement, {
      scale: 2, 
      useCORS: true,
      backgroundColor: null,
      logging: false,
      onclone: (clonedDoc) => {
        // THE FIX: Find all style tags and linked stylesheets in the cloned document
        const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
        
              styles.forEach((style) => {
        if (style instanceof HTMLLinkElement && style.href.includes('fonts.googleapis.com')) {
          return;
        }

        // Remove everything else
        style.remove();
      });

        // Ensure the cloned body has a fallback standard color to prevent inheriting complex CSS variables
        clonedDoc.body.style.color = '#000000';
      }
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "pt", "a4"); 
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    
    const filename = `${vaccineName.replace(/\s+/g, "_")}_Certificate.pdf`;
    pdf.save(filename);

  } catch (error) {
    console.error("Error generating PDF:", error);
  } finally {
    document.body.removeChild(container);
  }
};