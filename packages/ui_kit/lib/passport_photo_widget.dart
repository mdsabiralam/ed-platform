import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_cropper/image_cropper.dart';

class PassportPhotoWidget extends StatefulWidget {
  final File? imageFile;
  final Function(File) onImageCropped;

  const PassportPhotoWidget({
    Key? key,
    this.imageFile,
    required this.onImageCropped,
  }) : super(key: key);

  @override
  _PassportPhotoWidgetState createState() => _PassportPhotoWidgetState();
}

class _PassportPhotoWidgetState extends State<PassportPhotoWidget> {
  Future<void> _cropImage(File imageFile) async {
    final croppedFile = await ImageCropper().cropImage(
      sourcePath: imageFile.path,
      aspectRatio: const CropAspectRatio(ratioX: 1, ratioY: 1),
      maxWidth: 512,
      maxHeight: 512,
      uiSettings: [
        AndroidUiSettings(
          toolbarTitle: 'Crop Photo',
          toolbarColor: Colors.deepOrange,
          toolbarWidgetColor: Colors.white,
          initAspectRatio: CropAspectRatioPreset.square,
          lockAspectRatio: true,
        ),
        IOSUiSettings(
          title: 'Crop Photo',
          aspectRatioLockEnabled: true,
          resetAspectRatioEnabled: false,
        ),
      ],
    );

    if (croppedFile != null) {
      widget.onImageCropped(File(croppedFile.path));
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        if (widget.imageFile != null) {
          _cropImage(widget.imageFile!);
        }
      },
      child: Container(
        width: 150,
        height: 150,
        decoration: BoxDecoration(
          color: Colors.grey[200],
          border: Border.all(color: Colors.grey),
          borderRadius: BorderRadius.circular(8.0),
        ),
        child: widget.imageFile != null
            ? Image.file(widget.imageFile!, fit: BoxFit.cover)
            : const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.camera_alt, size: 40, color: Colors.grey),
                  SizedBox(height: 8),
                  Text('Tap to Crop', style: TextStyle(color: Colors.grey)),
                ],
              ),
      ),
    );
  }
}
