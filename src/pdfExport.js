import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateCAP741PDF = async (userData) => {
  const { profile, addresses, employmentHistory, entries, supervisors } = userData;
  
  const doc = new jsPDF();
  let yPosition = 20;

  // Helper function to add text with word wrap
  const addText = (text, x, y, maxWidth = 170) => {
    const lines = doc.splitTextToSize(text || '', maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * 7);
  };

  // Title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('CAP 741 - AIRCRAFT MAINTENANCE ENGINEER LOGBOOK', 105, yPosition, { align: 'center' });
  yPosition += 15;

  // Section 1.2 - Personal Data
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('SECTION 1.2 - PERSONAL DATA', 14, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  
  if (profile) {
    yPosition = addText(`Full Name: ${profile.full_name || 'N/A'}`, 14, yPosition);
    yPosition = addText(`Date of Birth: ${profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-GB') : 'N/A'}`, 14, yPosition);
    yPosition = addText(`Place of Birth: ${profile.place_of_birth || 'N/A'}`, 14, yPosition);
    yPosition = addText(`Nationality: ${profile.nationality || 'N/A'}`, 14, yPosition);
    yPosition = addText(`NAA Reference: ${profile.naa_reference || 'N/A'}`, 14, yPosition);
  }

  yPosition += 10;

  // Current Address
  if (addresses && addresses.length > 0) {
    const currentAddress = addresses.find(a => a.is_current) || addresses[0];
    doc.setFont(undefined, 'bold');
    doc.text('Current Address:', 14, yPosition);
    yPosition += 7;
    doc.setFont(undefined, 'normal');
    yPosition = addText(currentAddress.address_line_1, 14, yPosition);
    if (currentAddress.address_line_2) {
      yPosition = addText(currentAddress.address_line_2, 14, yPosition);
    }
    yPosition = addText(`${currentAddress.city}, ${currentAddress.postcode}`, 14, yPosition);
    yPosition = addText(currentAddress.country, 14, yPosition);
  }

  yPosition += 10;

  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Section 1.3 - Employment Record
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('SECTION 1.3 - EMPLOYMENT RECORD', 14, yPosition);
  yPosition += 10;

  if (employmentHistory && employmentHistory.length > 0) {
    const employmentData = employmentHistory.map(emp => [
      emp.company_name,
      emp.company_approval_number || 'N/A',
      emp.position,
      new Date(emp.from_date).toLocaleDateString('en-GB'),
      emp.to_date ? new Date(emp.to_date).toLocaleDateString('en-GB') : 'Present'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Company', 'Approval No.', 'Position', 'From', 'To']],
      body: employmentData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });

    yPosition = doc.lastAutoTable.finalY + 15;
  }

  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Section 2 - Maintenance Experience
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('SECTION 2 - MAINTENANCE EXPERIENCE', 14, yPosition);
  yPosition += 10;

  if (entries && entries.length > 0) {
    // Group entries by aircraft type
    const entriesByAircraft = entries.reduce((acc, entry) => {
      if (!acc[entry.aircraft_type]) acc[entry.aircraft_type] = [];
      acc[entry.aircraft_type].push(entry);
      return acc;
    }, {});

    // Generate table for each aircraft type
    Object.keys(entriesByAircraft).sort().forEach(aircraft => {
      // Check if we need a new page
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`Aircraft Type: ${aircraft}`, 14, yPosition);
      yPosition += 7;

      const aircraftEntries = entriesByAircraft[aircraft]
        .sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date))
        .map(entry => {
          const supervisor = supervisors.find(s => s.id === entry.supervisor_id);
          const supervisorText = supervisor 
            ? `${supervisor.approval_number} - ${supervisor.name}`
            : 'N/A';
          
          return [
            new Date(entry.entry_date).toLocaleDateString('en-GB'),
            entry.job_number,
            entry.ata_chapter,
            entry.task_description.substring(0, 60) + (entry.task_description.length > 60 ? '...' : ''),
            supervisorText
          ];
        });

      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Job No.', 'ATA', 'Task Description', 'Supervisor']],
        body: aircraftEntries,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        columnStyles: {
          3: { cellWidth: 60 }
        }
      });

      yPosition = doc.lastAutoTable.finalY + 12;
    });
  }

  // Footer on last page
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setFont(undefined, 'italic');
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')} - Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
  }

  // Save the PDF
  doc.save(`CAP741_Logbook_${profile?.full_name?.replace(/\s+/g, '_') || 'Export'}_${new Date().toISOString().split('T')[0]}.pdf`);
};