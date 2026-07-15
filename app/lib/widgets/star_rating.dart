import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class StarRating extends StatelessWidget {
  final double rating;
  final int count;
  final double size;

  const StarRating({
    super.key,
    required this.rating,
    this.count = 0,
    this.size = 16,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ...List.generate(5, (i) {
          final star = i + 1;
          return Icon(
            star <= rating ? Icons.star : (star - 0.5 <= rating ? Icons.star_half : Icons.star_border),
            size: size,
            color: AppTheme.accent,
          );
        }),
        if (count > 0) ...[
          const SizedBox(width: 4),
          Text(
            '($count)',
            style: TextStyle(
              fontSize: size - 2,
              color: AppTheme.textSecondary,
            ),
          ),
        ],
      ],
    );
  }
}
