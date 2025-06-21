import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20
  },
  header: {
    marginBottom: 20,
    textAlign: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 12,
    color: '#666666'
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  tableRow: { 
    margin: "auto", 
    flexDirection: "row" 
  },
  tableColHeader: {
    width: "20%",
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderRightWidth: 1,
    backgroundColor: '#f0f0f0',
    padding: 5
  },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderRightWidth: 1,
    padding: 5
  },
  headerText: {
    fontSize: 10,
    fontWeight: 'bold'
  },
  bodyText: {
    fontSize: 9
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15
  },
  statusActive: {
    color: '#52c41a',
    fontSize: 9
  },
  statusInactive: {
    color: '#ff4d4f',
    fontSize: 9
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#999999'
  }
});

// Create Document Component
const UserPdfDocument = ({ data }) => {
  const currentDate = new Date().toLocaleDateString();
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>User Report</Text>
          <Text style={styles.subtitle}>Generated on {currentDate}</Text>
        </View>
        
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.headerText}>Avatar</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.headerText}>Name</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.headerText}>Email</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.headerText}>Role</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.headerText}>Status</Text>
            </View>
          </View>
          
          {/* Table Rows */}
          {data.map((user, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Image 
                  style={styles.avatar} 
                  src={user.avatar || 'https://via.placeholder.com/30'} 
                />
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.bodyText}>{user.name}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.bodyText}>{user.email}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.bodyText}>{user.role}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={user.status === 'active' ? styles.statusActive : styles.statusInactive}>
                  {user.status.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.footer}>
          <Text>Total Users: {data.length}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default UserPdfDocument;