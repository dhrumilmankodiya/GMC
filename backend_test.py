import requests
import sys
import json
from datetime import datetime
import io
import pandas as pd

class GMCPlatformTester:
    def __init__(self, base_url="https://gmc-minimal-hub.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_credentials = {"email": "admin@gmc.com", "password": "Admin@123"}
        self.test_case_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = self.session.get(url)
            elif method == 'POST':
                if files:
                    response = self.session.post(url, data=data, files=files)
                else:
                    response = self.session.post(url, json=data)
            elif method == 'PUT':
                response = self.session.put(url, json=data)
            elif method == 'DELETE':
                response = self.session.delete(url)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data=self.admin_credentials
        )
        if success:
            print(f"   Logged in as: {response.get('name', 'Unknown')} ({response.get('role', 'Unknown')})")
        return success

    def test_get_current_user(self):
        """Test getting current user info"""
        return self.run_test("Get Current User", "GET", "auth/me", 200)

    def test_register_agent(self):
        """Test registering a new agent user"""
        agent_data = {
            "email": f"test_agent_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestAgent123!",
            "name": "Test Agent",
            "role": "agent"
        }
        return self.run_test("Register Agent", "POST", "auth/register", 200, data=agent_data)

    def test_create_case(self):
        """Test creating a new case"""
        case_data = {
            "client_name": f"Test Client {datetime.now().strftime('%H%M%S')}",
            "policy_type": "GMC",
            "notes": "Test case for automated testing"
        }
        success, response = self.run_test("Create Case", "POST", "cases", 200, data=case_data)
        if success and response.get('case_id'):
            self.test_case_id = response['case_id']
            print(f"   Created case: {self.test_case_id}")
        return success

    def test_get_cases(self):
        """Test getting cases list"""
        return self.run_test("Get Cases", "GET", "cases", 200)

    def test_get_case_details(self):
        """Test getting specific case details"""
        if not self.test_case_id:
            print("❌ No test case ID available")
            return False
        return self.run_test("Get Case Details", "GET", f"cases/{self.test_case_id}", 200)

    def test_upload_file(self):
        """Test file upload to case"""
        if not self.test_case_id:
            print("❌ No test case ID available")
            return False
        
        # Create a simple CSV file for testing
        csv_data = """Employee ID,Employee Name,Date of Birth,Gender,Sum Insured
EMP001,John Doe,1990-01-15,Male,500000
EMP002,Jane Smith,1985-03-22,Female,750000
EMP003,Bob Johnson,1992-07-10,Male,600000"""
        
        csv_file = io.StringIO(csv_data)
        files = {'file': ('test_data.csv', csv_file.getvalue(), 'text/csv')}
        
        return self.run_test(
            "Upload File",
            "POST",
            f"cases/{self.test_case_id}/upload",
            200,
            files=files
        )

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        return self.run_test("Dashboard Stats", "GET", "dashboard/stats", 200)

    def test_recent_activity(self):
        """Test recent activity"""
        return self.run_test("Recent Activity", "GET", "dashboard/recent-activity", 200)

    def test_admin_stats(self):
        """Test admin statistics"""
        return self.run_test("Admin Stats", "GET", "admin/stats", 200)

    def test_get_users(self):
        """Test getting users list"""
        return self.run_test("Get Users", "GET", "admin/users", 200)

    def test_get_templates(self):
        """Test getting templates"""
        return self.run_test("Get Templates", "GET", "templates", 200)

    def test_audit_logs(self):
        """Test audit logs"""
        return self.run_test("Audit Logs", "GET", "audit-logs", 200)

    def test_underwriter_queue(self):
        """Test underwriter queue"""
        return self.run_test("Underwriter Queue", "GET", "underwriter/queue", 200)

    def test_notifications(self):
        """Test notifications"""
        return self.run_test("Notifications", "GET", "notifications", 200)

    def test_logout(self):
        """Test logout"""
        return self.run_test("Logout", "POST", "auth/logout", 200)

def main():
    print("🚀 Starting GMC Platform API Testing...")
    print("=" * 50)
    
    tester = GMCPlatformTester()
    
    # Test sequence
    tests = [
        ("Health Check", tester.test_health_check),
        ("Admin Login", tester.test_admin_login),
        ("Get Current User", tester.test_get_current_user),
        ("Register Agent", tester.test_register_agent),
        ("Create Case", tester.test_create_case),
        ("Get Cases", tester.test_get_cases),
        ("Get Case Details", tester.test_get_case_details),
        ("Upload File", tester.test_upload_file),
        ("Dashboard Stats", tester.test_dashboard_stats),
        ("Recent Activity", tester.test_recent_activity),
        ("Admin Stats", tester.test_admin_stats),
        ("Get Users", tester.test_get_users),
        ("Get Templates", tester.test_get_templates),
        ("Audit Logs", tester.test_audit_logs),
        ("Underwriter Queue", tester.test_underwriter_queue),
        ("Notifications", tester.test_notifications),
        ("Logout", tester.test_logout),
    ]
    
    failed_tests = []
    
    for test_name, test_func in tests:
        try:
            success = test_func()
            if not success:
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")
            failed_tests.append(test_name)
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if failed_tests:
        print(f"\n❌ Failed Tests ({len(failed_tests)}):")
        for test in failed_tests:
            print(f"   - {test}")
    else:
        print("\n✅ All tests passed!")
    
    print(f"\n🎯 Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    return 0 if len(failed_tests) == 0 else 1

if __name__ == "__main__":
    sys.exit(main())