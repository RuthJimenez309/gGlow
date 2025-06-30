// Importaciones necesarias para construir la pantalla
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/Colors"; // Paleta de colores personalizados
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// ---------- Definición de Tipos ----------

// Tipos de navegación del stack
type RootStackParamList = {
  Home: undefined;
  // Agrega más rutas si se necesitan
};

type NewTransactionScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

// Tipos para los datos del formulario
type FormData = {
  amount: string;
  type: string;
  description: string;
};

// Tipos para los errores del formulario
type FormErrors = {
  amount: string;
  type: string;
  description: string;
};

// Opciones para el tipo de transacción
type TransactionTypeOption = {
  value: string;
  label: string;
};

// ---------- Componente Principal ----------
export default function NewTransactionScreen() {
  const navigation = useNavigation<NewTransactionScreenNavigationProp>();

  // Estado del formulario
  const [formData, setFormData] = useState<FormData>({
    amount: "",
    type: "ingreso",
    description: "",
  });

  // Estado de errores del formulario
  const [errors, setErrors] = useState<FormErrors>({
    amount: "",
    type: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Opciones de tipo de transacción disponibles
  const transactionTypes: TransactionTypeOption[] = [
    { value: "ingreso", label: "Ingreso" },
    { value: "gasto", label: "Gasto" },
    { value: "transferencia", label: "Transferencia" },
  ];

  // Función para manejar el cambio de valores en los inputs
  const handleChange = (name: keyof FormData, value: string) => {
    setFormData({ ...formData, [name]: value });

    // Limpiar el error si ya fue corregido
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Validaciones del formulario
  const validateForm = (): boolean => {
    let valid = true;
    const newErrors: FormErrors = { ...errors };

    // Validación de cantidad
    if (!formData.amount.trim()) {
      newErrors.amount = "La cantidad es requerida";
      valid = false;
    } else if (isNaN(Number(formData.amount))) {
      newErrors.amount = "Debe ser un número válido";
      valid = false;
    } else if (Number(formData.amount) <= 0) {
      newErrors.amount = "Debe ser mayor que 0";
      valid = false;
    }

    // Validación de descripción
    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
      valid = false;
    } else if (formData.description.length > 100) {
      newErrors.description = "Máximo 100 caracteres";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Envío de la transacción
  const submitTransaction = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const transactionToSend = {
      amount: parseFloat(formData.amount),
      type: formData.type,
      description: formData.description,
    };

    try {
      const response = await fetch("http://localhost:8000/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionToSend),
      });

      if (response.ok) {
        Alert.alert("Éxito", "Transacción registrada correctamente", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        const errorData = await response.json();
        Alert.alert(
          "Error",
          errorData.message || "Ocurrió un error al registrar la transacción"
        );
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Estilos condicionales para campos con errores
  const getInputContainerStyle = (hasError: boolean): ViewStyle => ({
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: hasError ? "#EF4444" : Colors.gray,
    paddingHorizontal: 15,
  });

  // ---------- Renderizado ----------
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Encabezado con botón de retroceso */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Feather name="arrow-left" size={24} color={Colors.tintColor} />
            </TouchableOpacity>
            <Text style={styles.title}>Nueva Transacción</Text>
          </View>

          {/* Formulario */}
          <View style={styles.formContainer}>
            {/* Cantidad */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cantidad (HNL)</Text>
              <View style={getInputContainerStyle(!!errors.amount)}>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 1500.00"
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.gray}
                  value={formData.amount}
                  onChangeText={(text) => handleChange("amount", text)}
                />
              </View>
              {errors.amount && (
                <Text style={styles.errorText}>{errors.amount}</Text>
              )}
            </View>

            {/* Tipo de transacción */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Transacción</Text>
              <View style={styles.radioGroup}>
                {transactionTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.radioButton,
                      formData.type === type.value && {
                        backgroundColor: Colors.tintColor + "20", // 20% de opacidad
                        borderRadius: 8,
                        paddingHorizontal: 8,
                      },
                    ]}
                    onPress={() => handleChange("type", type.value)}
                  >
                    <View style={styles.radioCircle}>
                      {formData.type === type.value && (
                        <View style={styles.radioInnerCircle} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.radioLabel,
                        formData.type === type.value &&
                          styles.radioLabelSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Descripción */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción</Text>
              <View style={getInputContainerStyle(!!errors.description)}>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Ej: Compra de materiales"
                  placeholderTextColor={Colors.gray}
                  multiline
                  numberOfLines={3}
                  maxLength={100}
                  value={formData.description}
                  onChangeText={(text) => handleChange("description", text)}
                />
              </View>
              {errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
              <Text style={styles.charCounter}>
                {formData.description.length}/100 caracteres
              </Text>
            </View>
          </View>

          {/* Botón de enviar */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={submitTransaction}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Enviando..." : "Registrar Transacción"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------- Estilos de la pantalla ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  formContainer: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#000",
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    height: 45,
    color: "#000",
    fontSize: 16,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
  charCounter: {
    color: Colors.gray,
    fontSize: 12,
    textAlign: "right",
    marginTop: 2,
  },
  radioGroup: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.tintColor,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioInnerCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.tintColor,
  },
  radioLabel: {
    color: "#000",
  },
  radioLabelSelected: {
    fontWeight: "bold",
    color: Colors.tintColor,
  },
  submitButton: {
    backgroundColor: Colors.tintColor,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.gray,
    opacity: 0.7,
  },
  submitButtonText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});
