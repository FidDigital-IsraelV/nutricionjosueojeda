import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

/**
 * Exports a DOM element as a PDF file
 * @param element The element to export
 * @param filename The filename for the PDF
 */
export async function exportToPDF(element: HTMLElement, filename: string): Promise<void> {
  console.log('Starting PDF export process...', element);
  
  // Display loading message 
  const loadingDiv = document.createElement('div');
  loadingDiv.style.position = 'fixed';
  loadingDiv.style.top = '0';
  loadingDiv.style.left = '0';
  loadingDiv.style.width = '100%';
  loadingDiv.style.height = '100%';
  loadingDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
  loadingDiv.style.display = 'flex';
  loadingDiv.style.justifyContent = 'center';
  loadingDiv.style.alignItems = 'center';
  loadingDiv.style.zIndex = '9999';
  loadingDiv.style.color = 'white';
  loadingDiv.style.fontSize = '20px';
  loadingDiv.textContent = 'Generando PDF...';
  document.body.appendChild(loadingDiv);

  try {
    // Make element visible if it's hidden
    const originalDisplay = element.style.display;
    const originalVisibility = element.style.visibility;
    const originalPosition = element.style.position;
    
    // Important: Make sure element is visible for html2canvas
    element.style.visibility = 'visible';
    element.style.display = 'block';
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '0px';
    document.body.appendChild(element.cloneNode(true));
    
    console.log('Creating canvas from element...', element.offsetWidth, 'x', element.offsetHeight);
    
    // Create canvas from element with improved settings
    const canvas = await html2canvas(element, {
      scale: 3, // Mantenemos escala alta para calidad
      useCORS: true,
      allowTaint: true,
      logging: true,
      backgroundColor: "#ffffff",
      windowWidth: 1200,
      onclone: (clonedDoc) => {
        console.log('Document cloned successfully');
        const clonedElement = clonedDoc.body.lastElementChild as HTMLElement;
        if (clonedElement) {
          clonedElement.style.width = "1000px";
          clonedElement.style.padding = "40px";
          clonedElement.style.fontFamily = "Arial, sans-serif";
          clonedElement.style.lineHeight = "1.5";
          clonedElement.style.color = "#333333";
          
          // Mejorar la calidad de las imágenes
          const images = clonedElement.querySelectorAll('img');
          images.forEach(img => {
            // Mantener proporción original
            const originalWidth = img.naturalWidth;
            const originalHeight = img.naturalHeight;
            const aspectRatio = originalHeight / originalWidth;
            
            // Establecer dimensiones fijas basadas en la proporción original
            img.style.width = '200px'; // Ancho fijo
            img.style.height = `${200 * aspectRatio}px`; // Alto proporcional
            img.style.objectFit = 'contain';
            img.style.imageRendering = 'crisp-edges';
            img.style.display = 'block';
            img.style.margin = '0 auto';
            
            // Forzar carga de imagen en alta calidad
            if (img.src.includes('?')) {
              img.src = img.src.split('?')[0] + '?width=400&quality=100';
            } else {
              img.src = img.src + '?width=400&quality=100';
            }
          });
          
          // Improve headings
          const headings = clonedElement.querySelectorAll('h1, h2, h3, h4');
          headings.forEach(heading => {
            const headingElement = heading as HTMLElement;
            headingElement.style.fontWeight = 'bold';
            headingElement.style.marginBottom = '16px';
            headingElement.style.color = '#1a1a1a';
          });
          
          // Improve tables
          const tables = clonedElement.querySelectorAll('table');
          tables.forEach(table => {
            const tableElement = table as HTMLElement;
            tableElement.style.borderCollapse = 'collapse';
            tableElement.style.width = '100%';
            tableElement.style.marginBottom = '20px';
          });
          
          // Improve cards
          const cards = clonedElement.querySelectorAll('.card');
          cards.forEach(card => {
            const cardElement = card as HTMLElement;
            cardElement.style.border = '1px solid #e5e7eb';
            cardElement.style.borderRadius = '8px';
            cardElement.style.padding = '16px';
            cardElement.style.marginBottom = '16px';
          });
          
          console.log('Styled cloned element');
        }
        return clonedDoc;
      }
    });
    
    console.log('Canvas created successfully, dimensions:', canvas.width, 'x', canvas.height);

    // Create PDF with A4 size
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    console.log('PDF object created');
    
    // Get PDF dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    console.log('PDF dimensions:', pdfWidth, 'x', pdfHeight);
    
    // Calculate image dimensions to fit PDF width while maintaining aspect ratio
    const imgWidth = pdfWidth - 20; // Add margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    console.log('Image dimensions for PDF:', imgWidth, 'x', imgHeight);
    
    // Function to add page header
    const addPageHeader = (pageNumber: number, totalPages: number) => {
      // Add current date and logo text to page header
      const currentDate = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es });
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(currentDate, 10, 10);
      
      // Add page number
      pdf.text(`Página ${pageNumber} de ${totalPages}`, pdfWidth / 2, 10, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, 'bold');
      pdf.text('THREEPERCENT', pdfWidth - 10, 10, { align: 'right' });
      pdf.setFont(undefined, 'normal');
    };
    
    // Function to add page footer
    const addPageFooter = () => {
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('© 2024 THREEPERCENT - Todos los derechos reservados', pdfWidth / 2, pdfHeight - 10, { align: 'center' });
    };
    
    // For simpler case, just add the whole canvas to a single page first
    if (imgHeight <= pdfHeight - 40) { // Increased margin for header and footer
      console.log('Content fits on a single page, using simplified approach');
      addPageHeader(1, 1);
      pdf.addImage(canvas, 'JPEG', 10, 20, imgWidth, imgHeight, undefined, 'FAST');
      addPageFooter();
    } else {
      // Calculate total pages needed
      const marginTop = 20; // Space for header
      const marginBottom = 20; // Space for footer
      const effectivePageHeight = pdfHeight - marginTop - marginBottom;
      const totalPages = Math.ceil(imgHeight / effectivePageHeight);
      console.log(`Content will span ${totalPages} pages`);
      
      // Process each page
      let remainingHeight = imgHeight;
      let sourceY = 0;
      
      for (let i = 0; i < totalPages; i++) {
        console.log(`Processing page ${i + 1} of ${totalPages}`);
        
        // For pages after the first, add a new page
        if (i > 0) {
          pdf.addPage();
        }
        
        // Add header to current page
        addPageHeader(i + 1, totalPages);
        
        // Calculate height to use on this page
        const pageContentHeight = Math.min(remainingHeight, effectivePageHeight);
        
        const sourceYRatio = sourceY / canvas.height;
        const pageHeightRatio = pageContentHeight / imgHeight;
        
        console.log(`Page ${i + 1}: Using canvas from Y=${sourceY} with height=${pageContentHeight}`);
        console.log(`Page ${i + 1}: Source ratios - Y=${sourceYRatio}, height=${pageHeightRatio}`);
        
        try {
          // Use a simpler approach to slicing the canvas for each page
          pdf.addImage(
            canvas, 
            'JPEG',
            10,                 // x position with margin
            marginTop,          // y position
            imgWidth,           // width in the PDF
            pageContentHeight,  // height in the PDF
            `page-${i}`,        // unique alias for each image
            'FAST'              // compression
          );
          
          // Add footer
          addPageFooter();
          
          // Update for next page
          remainingHeight -= pageContentHeight;
          sourceY += (pageContentHeight / imgHeight) * canvas.height;
        } catch (pageError) {
          console.error(`Error adding image to page ${i + 1}:`, pageError);
          throw new Error(`Error en página ${i + 1}: ${pageError.message}`);
        }
      }
    }
    
    // Save PDF
    console.log('Saving PDF...');
    const pdfOutput = pdf.output('datauristring');
    
    // Create a download link
    const link = document.createElement('a');
    link.href = pdfOutput;
    link.download = `${filename}_${format(new Date(), 'yyyyMMdd')}.pdf`;
    console.log('PDF ready for download', link.href.substring(0, 50) + '...');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Restore element's original styles
    element.style.display = originalDisplay;
    element.style.visibility = originalVisibility;
    element.style.position = originalPosition;
    
    toast.success("PDF generado exitosamente");
    console.log('PDF export completed successfully');
  } catch (error) {
    console.error('Error exporting PDF:', error);
    toast.error(`Error al generar el PDF: ${error.message || 'Error desconocido'}`);
  } finally {
    // Remove loading message
    if (document.body.contains(loadingDiv)) {
      document.body.removeChild(loadingDiv);
      console.log('Loading overlay removed');
    }
  }
}
