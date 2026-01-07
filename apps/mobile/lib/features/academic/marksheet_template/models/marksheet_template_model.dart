class MarksheetTemplateConfig {
  final String name;
  final LayoutConfig layoutConfig;

  MarksheetTemplateConfig({required this.name, required this.layoutConfig});

  Map<String, dynamic> toJson() => {
        'name': name,
        'layout_config': layoutConfig.toJson(),
      };
}

class LayoutConfig {
  final HeaderConfig header;
  final MarksTableConfig marksTable;
  final FooterConfig footer;

  LayoutConfig(
      {required this.header, required this.marksTable, required this.footer});

  Map<String, dynamic> toJson() => {
        'header': header.toJson(),
        'marks_table': marksTable.toJson(),
        'footer': footer.toJson(),
      };
}

class HeaderConfig {
  final bool showLogo;
  final double schoolNameFontSize;
  final double x;
  final double y;
  final double width;
  final double height;

  HeaderConfig({
    this.showLogo = true,
    this.schoolNameFontSize = 18.0,
    this.x = 0,
    this.y = 0,
    this.width = 500,
    this.height = 100,
  });

  Map<String, dynamic> toJson() => {
        'show_logo': showLogo,
        'school_name_font_size': schoolNameFontSize,
        'x': x,
        'y': y,
        'width': width,
        'height': height,
      };
}

class MarksTableConfig {
  final List<String> columns;
  final bool showAttendance;
  final double x;
  final double y;
  final double width;
  final double height;

  MarksTableConfig({
    required this.columns,
    this.showAttendance = true,
    this.x = 0,
    this.y = 100,
    this.width = 500,
    this.height = 200,
  });

  Map<String, dynamic> toJson() => {
        'columns': columns,
        'show_attendance': showAttendance,
        'x': x,
        'y': y,
        'width': width,
        'height': height,
      };
}

class FooterConfig {
  final bool showPrincipalSignature;
  final String disclaimerText;
  final double x;
  final double y;
  final double width;
  final double height;

  FooterConfig({
    this.showPrincipalSignature = true,
    this.disclaimerText = '...',
    this.x = 0,
    this.y = 500,
    this.width = 500,
    this.height = 150,
  });

  Map<String, dynamic> toJson() => {
        'show_principal_signature': showPrincipalSignature,
        'disclaimer_text': disclaimerText,
        'x': x,
        'y': y,
        'width': width,
        'height': height,
      };
}
