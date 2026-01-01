export interface MarksheetLayout {
  header: {
    logoPosition: 'left' | 'center' | 'right';
    schoolNameFontSize: number;
    showAddress: boolean;
  };
  studentInfo: {
    fields: ('name' | 'roll' | 'dob' | 'class' | 'section')[];
    layout: 'grid' | 'list';
  };
  marksTable: {
    visible_columns: ('subject' | 'max_marks' | 'marks_obtained' | 'grade' | 'percentage' | 'remarks' | 'attendance')[];
    showTotal: boolean;
  };
  footer: {
    signatures: { title: string; position: 'left' | 'center' | 'right' }[];
    showDate: boolean;
  };
}

export const SAMPLE_MARKSHEET_LAYOUT: MarksheetLayout = {
  header: {
    logoPosition: 'left',
    schoolNameFontSize: 24,
    showAddress: true,
  },
  studentInfo: {
    fields: ['name', 'roll', 'class', 'section', 'dob'],
    layout: 'grid',
  },
  marksTable: {
    visible_columns: ['subject', 'max_marks', 'marks_obtained', 'grade', 'remarks'],
    showTotal: true,
  },
  footer: {
    signatures: [
        { title: 'Class Teacher', position: 'left' },
        { title: 'Principal', position: 'right' }
    ],
    showDate: true,
  }
};
