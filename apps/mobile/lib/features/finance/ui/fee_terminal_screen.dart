import 'package:flutter/material.dart';
import 'package:mobile/core/api_client.dart'; // Assume exists
import 'package:mobile/features/finance/ui/day_book_widget.dart';
import 'package:blue_thermal_printer/blue_thermal_printer.dart';
import 'package:permission_handler/permission_handler.dart';

class FeeTerminalScreen extends StatefulWidget {
  const FeeTerminalScreen({Key? key}) : super(key: key);

  @override
  State<FeeTerminalScreen> createState() => _FeeTerminalScreenState();
}

class _FeeTerminalScreenState extends State<FeeTerminalScreen> {
  BlueThermalPrinter bluetooth = BlueThermalPrinter.instance;
  List<BluetoothDevice> _devices = [];
  BluetoothDevice? _device;
  bool _connected = false;

  @override
  void initState() {
    super.initState();
    _initPrinter();
  }

  void _initPrinter() async {
    // Request Bluetooth permissions for Android 12+
    await [
      Permission.bluetooth,
      Permission.bluetoothScan,
      Permission.bluetoothConnect,
      Permission.location, // Often needed for discovery
    ].request();

    bool? isConnected = await bluetooth.isConnected;
    List<BluetoothDevice> devices = [];
    try {
      devices = await bluetooth.getBondedDevices();
    } catch (e) {
      // Handle error
    }

    if (mounted) {
      setState(() {
        _devices = devices;
        _connected = isConnected ?? false;
      });
    }
  }

  void _connect(BluetoothDevice device) async {
    bluetooth.connect(device).then((_) {
      setState(() {
        _device = device;
        _connected = true;
      });
    });
  }

  void _printReceipt() async {
    if ((await bluetooth.isConnected) == true) {
      bluetooth.isConnected.then((isConnected) {
        if (isConnected == true) {
          bluetooth.printNewLine();
          bluetooth.printCustom("SCHOOL FEE RECEIPT", 3, 1);
          bluetooth.printNewLine();
          bluetooth.printLeftRight("Student:", "John Doe", 1);
          bluetooth.printLeftRight("Amount:", "\$500.00", 1);
          bluetooth.printNewLine();
          bluetooth.printCustom("Thank you!", 2, 1);
          bluetooth.printNewLine();
          bluetooth.paperCut();
        }
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Printer not connected")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    // 12.G.06 Landscape mode optimized
    // Ideally use OrientationBuilder, but assuming tablet implies often landscape or we force it in main.

    return Scaffold(
      appBar: AppBar(
        title: const Text("Fee Terminal"),
        actions: [
          DropdownButton<BluetoothDevice>(
            hint: const Text("Select Printer", style: TextStyle(color: Colors.white)),
            value: _device,
            dropdownColor: Colors.blue,
            iconEnabledColor: Colors.white,
            items: _devices.map((e) => DropdownMenuItem(
              child: Text(e.name ?? ""),
              value: e,
            )).toList(),
            onChanged: (device) {
              if (device != null) _connect(device);
            },
          ),
          const SizedBox(width: 20),
        ],
      ),
      body: Row(
        children: [
          // Left: Student Fee Search
          Expanded(
            flex: 1,
            child: Container(
              color: Colors.grey[100],
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Student Fee Search", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  TextField(
                    decoration: const InputDecoration(
                      labelText: "Search by Name or ID",
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.search),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // List of results would go here
                  Expanded(
                    child: ListView.builder(
                      itemCount: 5,
                      itemBuilder: (context, index) {
                        return Card(
                          child: ListTile(
                            title: Text("Student $index"),
                            subtitle: const Text("Class X-A"),
                            trailing: ElevatedButton(
                              onPressed: () {},
                              child: const Text("Select"),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const Divider(),
                  // 12.G.07 Day Book Widget integrated or separate?
                  // Prompt says "Create a Day Book widget... It should be a read-only summary".
                  // I will put it at the bottom or separate tab. Putting it here for accountant visibility.
                  const SizedBox(height: 10),
                  const DayBookWidget(),
                ],
              ),
            ),
          ),
          const VerticalDivider(width: 1),
          // Right: Cart/Receipt Preview
          Expanded(
            flex: 1,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                   const Text("Receipt Preview", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                   const SizedBox(height: 16),
                   Expanded(
                     child: Container(
                       padding: const EdgeInsets.all(16),
                       decoration: BoxDecoration(
                         border: Border.all(color: Colors.grey),
                         borderRadius: BorderRadius.circular(8),
                       ),
                       child: Column(
                         children: [
                           Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: const [Text("Tuition Fee"), Text("\$400")]),
                           const Divider(),
                           Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: const [Text("Transport Fee"), Text("\$100")]),
                           const Divider(),
                           const Spacer(),
                           Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: const [
                             Text("TOTAL", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                             Text("\$500", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18))
                           ]),
                         ],
                       ),
                     ),
                   ),
                   const SizedBox(height: 16),
                   SizedBox(
                     width: double.infinity,
                     height: 50,
                     child: ElevatedButton.icon(
                       icon: const Icon(Icons.print),
                       label: const Text("PRINT RECEIPT"),
                       onPressed: _printReceipt,
                     ),
                   ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
