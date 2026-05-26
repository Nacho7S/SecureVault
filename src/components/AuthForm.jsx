import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator
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
      {/* Header */}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {/* Fields */}
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

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>{submitLabel}</Text>
        }
      </TouchableOpacity>

      {/* Footer (link navigasi) */}
      {footer && footer}
    </View>
  );
}