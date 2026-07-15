import 'package:flutter_test/flutter_test.dart';
import 'package:maktech/main.dart';

void main() {
  testWidgets('App renders splash screen', (WidgetTester tester) async {
    await tester.pumpWidget(const MakTechApp());
    expect(find.text('Mak Tech'), findsOneWidget);
  });
}
