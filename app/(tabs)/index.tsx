import Colors from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Transaction = {
  id: number;
  amount: number;
  type: string;
  description: string;
  date?: string;
};

export default function IndexPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const getTransactionColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case "income":
      case "ingreso":
        return Colors.tintColor;
      case "expense":
      case "gasto":
        return "#EF4444"; // Rojo para gastos
      case "transferencia":
        return Colors.blue;
      default:
        return Colors.light.black;
    }
  };

  const getTransactionIcon = (
    type: string
  ): React.ComponentProps<typeof Feather>["name"] => {
    switch (type.toLowerCase()) {
      case "income":
      case "ingreso":
        return "arrow-down-circle";
      case "expense":
      case "gasto":
        return "arrow-up-circle";
      case "transferencia":
        return "repeat";
      default:
        return "dollar-sign";
    }
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("http://localhost:8000/transactions");
        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Calcular totales para las cards
  const calculateTotals = () => {
    const totals = {
      income: 0,
      expense: 0,
      food: 0,
      transport: 0,
      entertainment: 0,
      health: 0,
    };

    transactions.forEach((t) => {
      const amount = t.amount;
      const type = t.type.toLowerCase();

      if (type === "ingreso" || type === "income") {
        totals.income += amount;
      } else if (type === "gasto" || type === "expense") {
        totals.expense += amount;

        // Categorías de gastos basadas en descripción (simplificado)
        const desc = t.description.toLowerCase();
        if (
          desc.includes("comida") ||
          desc.includes("food") ||
          desc.includes("restaurante")
        ) {
          totals.food += amount;
        } else if (
          desc.includes("transporte") ||
          desc.includes("transport") ||
          desc.includes("taxi") ||
          desc.includes("gasolina")
        ) {
          totals.transport += amount;
        } else if (
          desc.includes("entretenimiento") ||
          desc.includes("entertainment") ||
          desc.includes("cine") ||
          desc.includes("netflix")
        ) {
          totals.entertainment += amount;
        } else if (
          desc.includes("salud") ||
          desc.includes("health") ||
          desc.includes("médico") ||
          desc.includes("farmacia")
        ) {
          totals.health += amount;
        }
      }
    });

    return totals;
  };

  const totals = calculateTotals();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Hello Ruth, Good Evening</Text>

        {/* 🔄 Recent Transactions Section */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading transactions...</Text>
        ) : transactions.length > 0 ? (
          <>
            {(showAllTransactions
              ? transactions
              : transactions.slice(0, 3)
            ).map((t) => (
              <View key={t.id} style={styles.transactionCard}>
                <View style={styles.transactionLeft}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: `${getTransactionColor(t.type)}20` },
                    ]}
                  >
                    <Feather
                      name={getTransactionIcon(t.type)}
                      size={20}
                      color={getTransactionColor(t.type)}
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription}>
                      {t.description}
                    </Text>
                    <View style={styles.transactionMeta}>
                      <Text style={styles.transactionType}>{t.type}</Text>
                      {t.date && (
                        <Text style={styles.transactionDate}>
                          {formatDate(t.date)}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    { color: getTransactionColor(t.type) },
                  ]}
                >
                  {formatAmount(t.amount)}
                </Text>
              </View>
            ))}

            {transactions.length > 3 && (
              <TouchableOpacity
                onPress={() => setShowAllTransactions(!showAllTransactions)}
                style={styles.toggleButton}
              >
                <Text style={styles.toggleButtonText}>
                  {showAllTransactions ? "Show Less" : "See All Transactions"}
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text style={styles.noTransactions}>No transactions available.</Text>
        )}

        {/* 🧾 Summary Cards */}
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.cardsContainer}>
          <View style={[styles.card, { backgroundColor: Colors.tintColor }]}>
            <Text style={styles.cardTitle}>Income</Text>
            <Text style={styles.cardAmount}>{formatAmount(totals.income)}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: "#EF4444" }]}>
            <Text style={styles.cardTitle}>Expenses</Text>
            <Text style={styles.cardAmount}>
              {formatAmount(totals.expense)}
            </Text>
          </View>
          <View style={[styles.card, { backgroundColor: Colors.blue }]}>
            <Text style={styles.cardTitle}>Food</Text>
            <Text style={styles.cardAmount}>{formatAmount(totals.food)}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: "#F59E0B" }]}>
            <Text style={styles.cardTitle}>Transport</Text>
            <Text style={styles.cardAmount}>
              {formatAmount(totals.transport)}
            </Text>
          </View>
          <View style={[styles.card, { backgroundColor: "#8B5CF6" }]}>
            <Text style={styles.cardTitle}>Entertainment</Text>
            <Text style={styles.cardAmount}>
              {formatAmount(totals.entertainment)}
            </Text>
          </View>
          <View style={[styles.card, { backgroundColor: "#10B981" }]}>
            <Text style={styles.cardTitle}>Health</Text>
            <Text style={styles.cardAmount}>{formatAmount(totals.health)}</Text>
          </View>
        </View>

        {/* 📌 Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.buttonSecondary}>
            <Text style={styles.buttonText}>Export Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.white,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.light.black,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.light.black,
  },
  loadingText: {
    textAlign: "center",
    color: Colors.gray,
    marginVertical: 20,
  },
  transactionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.black,
    marginBottom: 2,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionType: {
    fontSize: 12,
    color: Colors.gray,
    marginRight: 8,
    textTransform: "capitalize",
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.gray,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  noTransactions: {
    textAlign: "center",
    marginTop: 20,
    color: Colors.gray,
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    padding: 15,
    borderRadius: 10,
    width: "48%",
    marginBottom: 12,
    elevation: 2,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },
  cardAmount: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonsContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  buttonPrimary: {
    backgroundColor: Colors.tintColor,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    elevation: 3,
  },
  buttonSecondary: {
    backgroundColor: Colors.gray,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  toggleButton: {
    padding: 10,
    alignItems: "center",
    marginTop: 5,
  },
  toggleButtonText: {
    color: Colors.tintColor,
    fontWeight: "600",
  },
});
