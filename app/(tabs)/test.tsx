import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function TestScreen() {
  return (
    <KeyboardAwareScrollView
      extraScrollHeight={62}
      contentContainerStyle={styles.scrollContainer}
    >
      {/* 3. This View pushes content and buttons apart */}
      <View style={styles.contentWrapper}>
        {/* Your page content (forms, text, etc.) goes here */}
        <View>
          <Text style={styles.title}>Your Content</Text>
          <TextInput style={styles.input} placeholder="Tap me" />
          <TextInput style={styles.input} placeholder="Tap me" />
          <TextInput style={styles.input} placeholder="Tap me" />
        </View>

        {/* 4. Your buttons go here, at the bottom */}
        <View style={styles.buttonContainer}>
          <Button title="Save" />
          <Button title="Cancel" color="#FF6347" />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    // This allows the content to grow to at least the height of the screen
    flexGrow: 1,
  },
  contentWrapper: {
    // This makes the View fill the ScrollView's content area
    flex: 1,
    // This pushes the content (first View) and buttons (second View) apart
    justifyContent: 'space-between',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    // Styles for your button area
    marginTop: 20, // Ensures space if content is short
    marginBottom: 50,
  },
});
