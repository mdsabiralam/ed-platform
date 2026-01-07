import 'package:flutter/material.dart';
import 'package:confetti/confetti.dart';
import 'package:flutter_svg/flutter_svg.dart';

class BadgeItem {
  final String id;
  final String name;
  final String iconPath; // Can be SVG asset path or IconData
  final bool isUnlocked;

  BadgeItem({
    required this.id,
    required this.name,
    required this.iconPath,
    this.isUnlocked = false,
  });
}

class BadgeGrid extends StatefulWidget {
  final List<BadgeItem> badges;

  const BadgeGrid({Key? key, required this.badges}) : super(key: key);

  @override
  State<BadgeGrid> createState() => _BadgeGridState();
}

class _BadgeGridState extends State<BadgeGrid> {
  late ConfettiController _confettiController;

  @override
  void initState() {
    super.initState();
    _confettiController = ConfettiController(duration: const Duration(seconds: 3));

    // Check if any badge was recently unlocked to trigger confetti (logic can be external)
    // For demo, let's trigger it if there's at least one unlocked badge
    if (widget.badges.any((b) => b.isUnlocked)) {
      // _confettiController.play();
      // In real app, only play when state changes from locked to unlocked
    }
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  void _onBadgeTap(BadgeItem badge) {
    if (badge.isUnlocked) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("You earned: ${badge.name}!")),
      );
      _confettiController.play();
    } else {
       ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Keep working to unlock ${badge.name}!")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        GridView.builder(
          padding: const EdgeInsets.all(16),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
          ),
          itemCount: widget.badges.length,
          itemBuilder: (context, index) {
            final badge = widget.badges[index];
            return GestureDetector(
              onTap: () => _onBadgeTap(badge),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Expanded(
                    child: ColorFiltered(
                      colorFilter: badge.isUnlocked
                          ? const ColorFilter.mode(Colors.transparent, BlendMode.multiply)
                          : const ColorFilter.mode(Colors.grey, BlendMode.saturation),
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            if (badge.isUnlocked)
                              BoxShadow(
                                color: Colors.amber.withOpacity(0.4),
                                blurRadius: 10,
                                spreadRadius: 2,
                              )
                          ],
                        ),
                        padding: const EdgeInsets.all(12),
                         // Ideally use SvgPicture.asset if paths are SVGs, or Icon if IconData
                        child: const Icon(Icons.star, size: 40, color: Colors.amber),
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    badge.name,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            );
          },
        ),
        ConfettiWidget(
          confettiController: _confettiController,
          blastDirectionality: BlastDirectionality.explosive,
          shouldLoop: false,
          colors: const [Colors.green, Colors.blue, Colors.pink, Colors.orange, Colors.purple],
        ),
      ],
    );
  }
}
