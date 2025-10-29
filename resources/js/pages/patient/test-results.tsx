import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SharedNavigation from '@/components/SharedNavigation';
import { Head } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, FileText, Heart } from 'lucide-react';


interface PatientTestResultsProps {
    user: {
        name: string;
        email: string;
        role: string;
    };
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        patient_no: string;
    };
    testResults: {
        pending: Array<{
            id: number;
            created_at: string;
            tests: string[];
            status: string;
            notes: string;
        }>;
        completed: Array<{
            id: number;
            created_at: string;
            tests: string[];
            status: string;
            results: Array<{
                id: number;
                test_name: string;
                result_value: string;
                normal_range: string;
                unit: string;
                status: string;
                verified_at: string | null;
            }>;
            verified_at: string;
        }>;
        statistics: {
            total_tests: number;
            pending_tests: number;
            completed_tests: number;
        };
    };
    notifications?: Array<{
        id: number;
        type: string;
        title: string;
        message: string;
        read: boolean;
        created_at: string;
        data: any;
    }>;
    unreadCount?: number;
}

const getStatusBadge = (status: string) => {
    const statusConfig = {
        Completed: 'bg-green-100 text-green-800',
        Pending: 'bg-yellow-100 text-yellow-800',
        'In Progress': 'bg-blue-100 text-blue-800',
    };

    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
};

const getResultStatusBadge = (result: any) => {
    if (result.status === 'Normal') {
        return 'bg-green-100 text-green-800';
    } else if (result.status === 'Abnormal') {
        return 'bg-red-100 text-red-800';
    } else {
        return 'bg-yellow-100 text-yellow-800';
    }
};

export default function PatientTestResults({ user, patient, testResults, notifications = [], unreadCount = 0 }: PatientTestResultsProps) {
    return (
        <div className="min-h-screen bg-white">
            <Head title="Test Results - SJHI Industrial Clinic" />
            
            {/* Shared Navigation */}
            <SharedNavigation user={user} currentPath="/patient/test-results" notifications={notifications} unreadCount={unreadCount} />
            
            <div className="min-h-screen bg-gray-50 p-6">

                {/* Summary Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                                <p className="text-2xl font-bold text-blue-600">{testResults.statistics.total_tests}</p>
                            </div>
                            <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Results</p>
                                <p className="text-2xl font-bold text-yellow-600">{testResults.statistics.pending_tests}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-600" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed Results</p>
                                <p className="text-2xl font-bold text-green-600">{testResults.statistics.completed_tests}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </Card>
                </div>

                {/* Pending Results */}
                {testResults.pending.length > 0 && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-yellow-600" />
                                Pending Test Results
                            </CardTitle>
                            <CardDescription>Tests that are currently being processed</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Tests Ordered</TableHead>
                                        <TableHead>Order Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.isArray(testResults?.pending)
                                        ? testResults.pending.map((order) => (
                                              <TableRow key={order.id}>
                                                  <TableCell>
                                                      <div className="flex items-center gap-2">
                                                          <FileText className="h-4 w-4 text-blue-500" />#{order.id}
                                                      </div>
                                                  </TableCell>
                                                  <TableCell>
                                                      <div className="space-y-1">
                                                          {Array.isArray(order?.tests)
                                                              ? order.tests.map((test, index) => (
                                                                    <div key={index} className="text-sm text-gray-600">
                                                                        {test}
                                                                    </div>
                                                                ))
                                                              : null}
                                                      </div>
                                                  </TableCell>
                                                  <TableCell>
                                                      <div className="flex items-center gap-2">
                                                          <Calendar className="h-4 w-4 text-gray-500" />
                                                          {order.created_at}
                                                      </div>
                                                  </TableCell>
                                                  <TableCell>
                                                      <Badge className={getStatusBadge(order.status)}>{order.status}</Badge>
                                                  </TableCell>
                                                  <TableCell>
                                                      <Button variant="outline" size="sm" disabled>
                                                          <Clock className="mr-2 h-4 w-4" />
                                                          Processing
                                                      </Button>
                                                  </TableCell>
                                              </TableRow>
                                          ))
                                        : null}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Completed Results */}
                {testResults.completed.length > 0 && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                Completed Test Results
                            </CardTitle>
                            <CardDescription>Your verified laboratory test results</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {Array.isArray(testResults?.completed)
                                    ? testResults.completed.map((order) => (
                                          <Card key={order.id} className="border-l-4 border-l-green-500">
                                              <CardHeader className="pb-3">
                                                  <div className="flex items-center justify-between">
                                                      <div>
                                                          <CardTitle className="text-lg">Lab Order #{order.id}</CardTitle>
                                                          <CardDescription>
                                                              Ordered: {order.created_at} | Verified: {order.verified_at}
                                                          </CardDescription>
                                                      </div>
                                                      <Badge className={getStatusBadge(order.status)}>{order.status}</Badge>
                                                  </div>
                                              </CardHeader>
                                              <CardContent>
                                                  <div className="space-y-4">
                                                      <div>
                                                          <h4 className="mb-2 font-semibold text-gray-700">Tests Performed:</h4>
                                                          <div className="flex flex-wrap gap-2">
                                                              {Array.isArray(order?.tests)
                                                                  ? order.tests.map((test, index) => (
                                                                        <Badge key={index} variant="outline">
                                                                            {test}
                                                                        </Badge>
                                                                    ))
                                                                  : null}
                                                          </div>
                                                      </div>

                                                      <div>
                                                          <h4 className="mb-2 font-semibold text-gray-700">Results:</h4>
                                                          <Table>
                                                              <TableHeader>
                                                                  <TableRow>
                                                                      <TableHead>Test Name</TableHead>
                                                                      <TableHead>Result</TableHead>
                                                                      <TableHead>Normal Range</TableHead>
                                                                      <TableHead>Unit</TableHead>
                                                                      <TableHead>Status</TableHead>
                                                                  </TableRow>
                                                              </TableHeader>
                                                              <TableBody>
                                                                  {Array.isArray(order?.results)
                                                                      ? order.results.map((result) => (
                                                                            <TableRow key={result.id}>
                                                                                <TableCell className="font-medium">{result.test_name}</TableCell>
                                                                                <TableCell className="font-semibold">{result.result_value}</TableCell>
                                                                                <TableCell className="text-gray-600">{result.normal_range}</TableCell>
                                                                                <TableCell className="text-gray-600">{result.unit}</TableCell>
                                                                                <TableCell>
                                                                                    <Badge className={getResultStatusBadge(result)}>
                                                                                        {result.status}
                                                                                    </Badge>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))
                                                                      : null}
                                                              </TableBody>
                                                          </Table>
                                                      </div>
                                                  </div>
                                              </CardContent>
                                          </Card>
                                      ))
                                    : null}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* No Results Message */}
                {testResults.pending.length === 0 && testResults.completed.length === 0 && (
                    <Card className="p-8 text-center">
                        <div className="flex flex-col items-center space-y-4">
                            <FileText className="h-16 w-16 text-gray-400" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">No Test Results Found</h3>
                                <p className="text-gray-600">You don't have any laboratory test results yet. Contact your doctor to order tests.</p>
                            </div>
                            <Button className="mt-4">
                                <Heart className="mr-2 h-4 w-4" />
                                Contact Doctor
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
