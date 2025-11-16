import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SharedNavigation from '@/components/SharedNavigation';
import { Head } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, FileText, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';


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
                test_id: number;
                test_name: string;
                result_value: string;
                normal_range: string;
                unit: string;
                status: string;
                verified_at: string | null;
                verified_by?: string;
                order_id: number;
                detailed_values?: Array<{
                    parameter_key: string;
                    parameter_label: string;
                    value: string;
                    unit?: string;
                    reference_text?: string;
                    reference_min?: string;
                    reference_max?: string;
                }>;
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
    const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

    const toggleOrder = (orderId: number) => {
        setExpandedOrders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
    };

    return (
        <div className="min-h-screen bg-white">
            <Head title="Test Results" />
            
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
                            <div className="space-y-4">
                                {Array.isArray(testResults?.completed)
                                    ? testResults.completed.map((order) => {
                                          const isExpanded = expandedOrders.has(order.id);
                                          return (
                                          <Card key={order.id} className="border-l-4 border-l-green-500">
                                                  <CardHeader 
                                                      className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                                      onClick={() => toggleOrder(order.id)}
                                                  >
                                                  <div className="flex items-center justify-between">
                                                          <div className="flex-1">
                                                              <div className="flex items-center gap-2">
                                                          <CardTitle className="text-lg">Lab Order #{order.id}</CardTitle>
                                                                  {isExpanded ? (
                                                                      <ChevronUp className="h-5 w-5 text-gray-500" />
                                                                  ) : (
                                                                      <ChevronDown className="h-5 w-5 text-gray-500" />
                                                                  )}
                                                              </div>
                                                          <CardDescription>
                                                              Ordered: {order.created_at} | Verified: {order.verified_at}
                                                          </CardDescription>
                                                              {!isExpanded && (
                                                                  <div className="mt-2 flex flex-wrap gap-2">
                                                                      {Array.isArray(order?.tests) && order.tests.slice(0, 3).map((test, index) => (
                                                                          <Badge key={index} variant="outline" className="text-xs">
                                                                              {test}
                                                                          </Badge>
                                                                      ))}
                                                                      {Array.isArray(order?.tests) && order.tests.length > 3 && (
                                                                          <Badge variant="outline" className="text-xs">
                                                                              +{order.tests.length - 3} more
                                                                          </Badge>
                                                                      )}
                                                                  </div>
                                                              )}
                                                      </div>
                                                      <Badge className={getStatusBadge(order.status)}>{order.status}</Badge>
                                                  </div>
                                              </CardHeader>
                                                  {isExpanded && (
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
                                                          {Array.isArray(order?.results) && order.results.length > 0 ? (
                                                              order.results.map((result) => (
                                                                  <div key={result.id} className="mb-6 rounded-lg border border-gray-200 p-4">
                                                                      <div className="mb-3 flex items-center justify-between border-b pb-2">
                                                                          <div>
                                                                              <h5 className="text-lg font-semibold text-gray-900">{result.test_name}</h5>
                                                                          </div>
                                                                                    <Badge className={getResultStatusBadge(result)}>
                                                                              {result.status === 'verified' ? 'Verified' : result.status}
                                                                                    </Badge>
                                                                      </div>
                                                                      
                                                                      {/* Detailed Values - Grouped by category like admin side */}
                                                                      {result.detailed_values && result.detailed_values.length > 0 ? (
                                                                          <div className="space-y-4">
                                                                              {(() => {
                                                                                  // Group values by parameter_key prefix (e.g., "physical_examination", "microscopic")
                                                                                  const grouped = result.detailed_values.reduce((acc: any, value: any) => {
                                                                                      const key = value.parameter_key?.split('.')[0] || 'general';
                                                                                      if (!acc[key]) acc[key] = [];
                                                                                      acc[key].push(value);
                                                                                      return acc;
                                                                                  }, {});
                                                                                  
                                                                                  return Object.entries(grouped).map(([category, values]: [string, any]) => (
                                                                                      <div key={category} className="border border-gray-200 rounded-lg p-4">
                                                                                          <h6 className="font-semibold text-gray-900 mb-3 capitalize">
                                                                                              {category.replace(/_/g, ' ')}
                                                                                          </h6>
                                                                                          <div className="grid gap-3 md:grid-cols-2">
                                                                                              {values.map((value: any, idx: number) => (
                                                                                                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                                                      <div className="flex-1">
                                                                                                          <p className="font-medium text-gray-900">{value.parameter_label || value.parameter_key}</p>
                                                                                                          <p className="text-sm text-gray-600">
                                                                                                              {value.value} {value.unit && `(${value.unit})`}
                                                                                                          </p>
                                                                                                          {value.reference_text && (
                                                                                                              <p className="text-xs text-gray-500 mt-1">
                                                                                                                  Reference: {value.reference_text}
                                                                                                              </p>
                                                                                                          )}
                                                                                                          {(value.reference_min && value.reference_max) && (
                                                                                                              <p className="text-xs text-gray-500 mt-1">
                                                                                                                  Range: {value.reference_min} - {value.reference_max}
                                                                                                              </p>
                                                                                                          )}
                                                                                                      </div>
                                                                                                  </div>
                                                                                              ))}
                                                                                          </div>
                                                                                      </div>
                                                                                  ));
                                                                              })()}
                                                                          </div>
                                                                      ) : (
                                                                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                                                              <p className="font-medium text-gray-900">Result</p>
                                                                              <p className="text-sm text-gray-600">
                                                                                  {result.result_value} {result.unit && `(${result.unit})`}
                                                                              </p>
                                                                              {result.normal_range && (
                                                                                  <p className="text-xs text-gray-500 mt-1">
                                                                                      Reference: {result.normal_range}
                                                                                  </p>
                                                                              )}
                                                                          </div>
                                                                      )}
                                                                      
                                                                      {/* Verification Info */}
                                                                      {(result.verified_by || result.verified_at) && (
                                                                          <div className="flex items-center gap-4 border-t pt-3 mt-4 text-sm text-gray-600">
                                                                              {result.verified_by && (
                                                                                  <span>Verified by: <strong>{result.verified_by}</strong></span>
                                                                              )}
                                                                              {result.verified_at && (
                                                                                  <span>Verified on: <strong>{result.verified_at}</strong></span>
                                                                              )}
                                                                          </div>
                                                                      )}
                                                                  </div>
                                                              ))
                                                          ) : (
                                                              <p className="text-sm text-gray-500">No results available</p>
                                                          )}
                                                      </div>
                                                      
                                                  </div>
                                              </CardContent>
                                                  )}
                                          </Card>
                                          );
                                      })
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
