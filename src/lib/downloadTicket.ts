import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function downloadTicket(ticketRef?: React.RefObject<HTMLDivElement | null>) {
  const ticket = ticketRef?.current || document.getElementById('ticket');
  console.log('downloadTicket: ticketRef', ticketRef);
  console.log('downloadTicket: ticket element', ticket);
  
  if (!ticket) {
    alert('Ticket element not found!');
    return;
  }

  // Print the outer HTML for debugging
  console.log('downloadTicket: ticket outerHTML', ticket.outerHTML);
  
  try {
    // Wait a bit for any dynamic content to render
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Method 1: Try with html2canvas first
    try {
      await generatePDFWithCanvas(ticket);
      return;
    } catch (canvasError) {
      console.warn('Canvas method failed, trying alternative:', canvasError);
    }
    
    // Method 2: Fallback to basic PDF generation
    try {
      await generateBasicPDF(ticket);
      return;
    } catch (basicError) {
      console.warn('Basic method failed:', basicError);
      throw new Error('All PDF generation methods failed');
    }
    
  } catch (err) {
    console.error('PDF download error:', err);
    alert('Failed to generate PDF. Please try again or use browser print function (Ctrl+P).');
  }
}

async function generatePDFWithCanvas(ticket: HTMLElement) {
  // Use html2canvas with better options for PDF generation
  const canvas = await html2canvas(ticket, { 
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: ticket.scrollWidth,
    height: ticket.scrollHeight,
    scrollX: 0,
    scrollY: 0
  });
  
  const imgData = canvas.toDataURL('image/png', 1.0);
  
  // Create PDF with better dimensions
  const pdf = new jsPDF({ 
    orientation: 'portrait', 
    unit: 'mm', 
    format: 'a4',
    compress: true
  });
  
  // Get page dimensions
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Get image dimensions
  const imgProps = pdf.getImageProperties(imgData);
  const imgWidth = imgProps.width;
  const imgHeight = imgProps.height;
  
  // Calculate scaling to fit the image properly on the page
  const scaleX = pageWidth / imgWidth;
  const scaleY = pageHeight / imgHeight;
  const scale = Math.min(scaleX, scaleY) * 0.95; // 95% to add some margin
  
  // Calculate final dimensions
  const finalWidth = imgWidth * scale;
  const finalHeight = imgHeight * scale;
  
  // Center the image on the page
  const x = (pageWidth - finalWidth) / 2;
  const y = (pageHeight - finalHeight) / 2;
  
  // Add the image to PDF
  pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
  
  // Save the PDF
  pdf.save('aero-link-flight-ticket.pdf');
  
  console.log('PDF generated successfully with canvas method');
  console.log('Image dimensions:', { width: imgWidth, height: imgHeight });
  console.log('PDF dimensions:', { width: pageWidth, height: pageHeight });
  console.log('Final dimensions:', { width: finalWidth, height: finalHeight });
}

async function generateBasicPDF(ticket: HTMLElement) {
  // Create a basic PDF with text content
  const pdf = new jsPDF({ 
    orientation: 'portrait', 
    unit: 'mm', 
    format: 'a4',
    compress: true
  });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Set font
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  
  // Title
  pdf.text('Aero Link - Flight Ticket', pageWidth / 2, 20, { align: 'center' });
  
  // Add a line
  pdf.setDrawColor(0);
  pdf.line(20, 30, pageWidth - 20, 30);
  
  // Extract text content from ticket
  const textContent = extractTextFromElement(ticket);
  
  // Add text content
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  
  let yPosition = 50;
  const lineHeight = 8;
  const margin = 20;
  
  textContent.forEach((line, index) => {
    if (yPosition > pageHeight - 20) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.text(line, margin, yPosition);
    yPosition += lineHeight;
  });
  
  pdf.save('aero-link-flight-ticket-basic.pdf');
  console.log('PDF generated successfully with basic method');
}

function extractTextFromElement(element: HTMLElement): string[] {
  const textLines: string[] = [];
  
  function extractText(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        textLines.push(text);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      
      // Skip hidden elements
      if (element.style.display === 'none' || element.style.visibility === 'hidden') {
        return;
      }
      
      // Add text content for specific elements
      if (element.tagName === 'H1' || element.tagName === 'H2' || element.tagName === 'H3') {
        const text = element.textContent?.trim();
        if (text) {
          textLines.push(`** ${text} **`);
        }
      }
      
      // Recursively process child nodes
      for (const child of Array.from(element.childNodes)) {
        extractText(child);
      }
    }
  }
  
  extractText(element);
  return textLines.filter(line => line.length > 0);
} 