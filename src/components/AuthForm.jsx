import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authStyles as styles } from "../styles/authStyles";

export default function AuthForm({
  title,
  subtitle,
  fields,
  values,
  onChange,
  errors = {},
  onSubmit,
  submitLabel,
  loading = false,
  footer,
}) {
  return (
    <View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {fields.map((field) => (
        <View key={field.key} style={styles.inputGroup}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            style={[styles.input, errors[field.key] && styles.inputError]}
            placeholder={field.placeholder}
            placeholderTextColor="#64748b"
            value={values[field.key] || ""}
            onChangeText={(val) => onChange(field.key, val)}
            secureTextEntry={field.secureTextEntry || false}
            autoCapitalize={field.autoCapitalize || "none"}
            autoCorrect={false}
            keyboardType={field.keyboardType || "default"}
          />
          {errors[field.key] && (
            <Text style={styles.errorText}>{errors[field.key]}</Text>
          )}
        </View>
      ))}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{submitLabel}</Text>
        )}
      </TouchableOpacity>

      {footer && footer}
    </View>
  );
}
