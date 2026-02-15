#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta
from uuid import uuid4

class FinanceBudgetAPITester:
    def __init__(self, base_url="https://financenight.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_accounts = []
        self.created_transactions = []
        self.created_categories = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        return success

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request and return response"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            
            success = response.status_code == expected_status
            return success, response
        except Exception as e:
            print(f"Request failed: {str(e)}")
            return False, None

    def test_categories_endpoints(self):
        """Test category endpoints"""
        print("\n🔍 Testing Categories Endpoints...")
        
        # Test GET categories (should have default categories)
        success, response = self.make_request('GET', 'categories')
        if success and response:
            categories = response.json()
            self.log_test("GET /categories", len(categories) > 0, f"Found {len(categories)} categories")
        else:
            self.log_test("GET /categories", False, "Failed to fetch categories")
        
        # Test POST category
        test_category = {
            "name": f"Test Category {uuid4().hex[:8]}",
            "type": "expense",
            "icon": "TestIcon"
        }
        success, response = self.make_request('POST', 'categories', test_category, 200)
        if success and response:
            created_category = response.json()
            self.created_categories.append(created_category['id'])
            self.log_test("POST /categories", True, f"Created category: {created_category['name']}")
        else:
            error_msg = f"Status: {response.status_code if response else 'No response'}"
            if response:
                try:
                    error_msg += f", Response: {response.text}"
                except:
                    pass
            self.log_test("POST /categories", False, f"Failed to create category - {error_msg}")

    def test_accounts_endpoints(self):
        """Test account CRUD operations"""
        print("\n🔍 Testing Accounts Endpoints...")
        
        # Test GET accounts (initially empty)
        success, response = self.make_request('GET', 'accounts')
        self.log_test("GET /accounts", success, f"Status: {response.status_code if response else 'No response'}")
        
        # Test POST account
        test_account = {
            "name": f"Test Account {uuid4().hex[:8]}",
            "type": "Bank",
            "balance": 1000.50
        }
        success, response = self.make_request('POST', 'accounts', test_account, 200)
        if success and response:
            created_account = response.json()
            self.created_accounts.append(created_account['id'])
            self.log_test("POST /accounts", True, f"Created account: {created_account['name']}")
            
            # Test GET specific account
            success, response = self.make_request('GET', f"accounts/{created_account['id']}")
            self.log_test("GET /accounts/{id}", success, f"Retrieved account: {created_account['name']}")
            
            # Test PUT account
            updated_data = {
                "name": f"Updated {test_account['name']}",
                "type": "Savings",
                "balance": 1500.75
            }
            success, response = self.make_request('PUT', f"accounts/{created_account['id']}", updated_data)
            self.log_test("PUT /accounts/{id}", success, "Updated account successfully")
            
        else:
            error_msg = f"Status: {response.status_code if response else 'No response'}"
            if response:
                try:
                    error_msg += f", Response: {response.text}"
                except:
                    pass
            self.log_test("POST /accounts", False, f"Failed to create account - {error_msg}")

    def test_transactions_endpoints(self):
        """Test transaction CRUD operations"""
        print("\n🔍 Testing Transactions Endpoints...")
        
        if not self.created_accounts:
            print("⚠️  No accounts available for transaction testing")
            return
        
        account_id = self.created_accounts[0]
        
        # Test GET transactions (initially empty)
        success, response = self.make_request('GET', 'transactions')
        self.log_test("GET /transactions", success, f"Status: {response.status_code if response else 'No response'}")
        
        # Test POST income transaction
        income_transaction = {
            "type": "income",
            "amount": 500.00,
            "category": "Salary",
            "account_id": account_id,
            "date": datetime.now().strftime('%Y-%m-%d'),
            "note": "Test income transaction"
        }
        success, response = self.make_request('POST', 'transactions', income_transaction, 200)
        if success and response:
            created_transaction = response.json()
            self.created_transactions.append(created_transaction['id'])
            self.log_test("POST /transactions (income)", True, f"Created income: ${created_transaction['amount']}")
        else:
            self.log_test("POST /transactions (income)", False, "Failed to create income transaction")
        
        # Test POST expense transaction
        expense_transaction = {
            "type": "expense",
            "amount": 150.00,
            "category": "Food & Dining",
            "account_id": account_id,
            "date": datetime.now().strftime('%Y-%m-%d'),
            "note": "Test expense transaction"
        }
        success, response = self.make_request('POST', 'transactions', expense_transaction, 200)
        if success and response:
            created_transaction = response.json()
            self.created_transactions.append(created_transaction['id'])
            self.log_test("POST /transactions (expense)", True, f"Created expense: ${created_transaction['amount']}")
        else:
            self.log_test("POST /transactions (expense)", False, "Failed to create expense transaction")
        
        # Test GET transactions with filters
        today = datetime.now().strftime('%Y-%m-%d')
        success, response = self.make_request('GET', f'transactions?start_date={today}&end_date={today}')
        self.log_test("GET /transactions with date filter", success, "Date filtering works")

    def test_dashboard_stats(self):
        """Test dashboard statistics endpoint"""
        print("\n🔍 Testing Dashboard Stats...")
        
        success, response = self.make_request('GET', 'dashboard/stats')
        if success and response:
            stats = response.json()
            required_fields = ['total_balance', 'total_income', 'total_expense', 'expenses_by_category', 'balance_history']
            all_fields_present = all(field in stats for field in required_fields)
            self.log_test("GET /dashboard/stats", all_fields_present, f"All required fields present: {all_fields_present}")
            
            # Verify data types
            if all_fields_present:
                self.log_test("Dashboard stats structure", 
                    isinstance(stats['expenses_by_category'], list) and 
                    isinstance(stats['balance_history'], list),
                    "Correct data types for arrays")
        else:
            self.log_test("GET /dashboard/stats", False, "Failed to fetch dashboard stats")

    def test_error_handling(self):
        """Test error handling for invalid requests"""
        print("\n🔍 Testing Error Handling...")
        
        # Test GET non-existent account
        success, response = self.make_request('GET', 'accounts/non-existent-id', expected_status=404)
        self.log_test("GET non-existent account", success, "Returns 404 as expected")
        
        # Test DELETE non-existent account
        success, response = self.make_request('DELETE', 'accounts/non-existent-id', expected_status=404)
        self.log_test("DELETE non-existent account", success, "Returns 404 as expected")
        
        # Test POST transaction with invalid account
        invalid_transaction = {
            "type": "income",
            "amount": 100.00,
            "category": "Salary",
            "account_id": "non-existent-account",
            "date": datetime.now().strftime('%Y-%m-%d'),
            "note": "Invalid transaction"
        }
        success, response = self.make_request('POST', 'transactions', invalid_transaction, expected_status=404)
        self.log_test("POST transaction with invalid account", success, "Returns 404 as expected")

    def cleanup_test_data(self):
        """Clean up created test data"""
        print("\n🧹 Cleaning up test data...")
        
        # Delete transactions
        for transaction_id in self.created_transactions:
            success, _ = self.make_request('DELETE', f'transactions/{transaction_id}')
            if success:
                print(f"✅ Deleted transaction: {transaction_id}")
        
        # Delete accounts
        for account_id in self.created_accounts:
            success, _ = self.make_request('DELETE', f'accounts/{account_id}')
            if success:
                print(f"✅ Deleted account: {account_id}")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Financial Budget API Tests...")
        print(f"Testing API at: {self.api_url}")
        
        try:
            # Test basic connectivity
            success, response = self.make_request('GET', 'categories')
            if not success:
                print("❌ Cannot connect to API. Check if backend is running.")
                return False
            
            # Run all test suites
            self.test_categories_endpoints()
            self.test_accounts_endpoints()
            self.test_transactions_endpoints()
            self.test_dashboard_stats()
            self.test_error_handling()
            
            # Cleanup
            self.cleanup_test_data()
            
            # Print summary
            print(f"\n📊 Test Summary:")
            print(f"Tests Run: {self.tests_run}")
            print(f"Tests Passed: {self.tests_passed}")
            print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
            
            return self.tests_passed == self.tests_run
            
        except Exception as e:
            print(f"❌ Test suite failed with error: {str(e)}")
            return False

def main():
    tester = FinanceBudgetAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())