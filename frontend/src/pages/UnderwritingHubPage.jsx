import { useState, useEffect, useMemo } from 'react';

/* eslint-disable react-hooks/exhaustive-deps */
import { useParams, useNavigate, Link } from 'react-router-dom';

/* eslint-disable react-hooks/exhaustive-deps */
import Layout from '../components/Layout';

/* eslint-disable react-hooks/exhaustive-deps */
import { casesApi } from '../lib/api';

/* eslint-disable react-hooks/exhaustive-deps */
import { toast } from 'sonner';

/* eslint-disable react-hooks/exhaustive-deps */
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';

/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from '../components/ui/button';

/* eslint-disable react-hooks/exhaustive-deps */
import { Badge } from '../components/ui/badge';

/* eslint-disable react-hooks/exhaustive-deps */
import { Input } from '../components/ui/input';

/* eslint-disable react-hooks/exhaustive-deps */
import { Progress } from '../components/ui/progress';

/* eslint-disable react-hooks/exhaustive-deps */
import { Skeleton } from '../components/ui/skeleton';

/* eslint-disable react-hooks/exhaustive-deps */
import { Textarea } from '../components/ui/textarea';

/* eslint-disable react-hooks/exhaustive-deps */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  ArrowLeft,
  Users,
  DollarSign,
  Shield,
  Sparkles,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Edit3,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// Risk Gauge Component
function RiskGauge({ score, label = 'Risk Score' }) {
  const getColor = (val) => {
    if (val >= 70) return 'text-red-600 bg-red-50';
    if (val >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  const getGaugeColor = (val) => {
    if (val >= 70) return 'bg-red-500';
    if (val >= 40) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-zinc-100"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            strokeWidth="12"
            strokeLinecap="round"
            className={getGaugeColor(score)}
            style={{
              strokeDasharray: 352,
              strokeDashoffset: 352 - (352 * score) / 100,
              transition: 'stroke-dashoffset 0.5s ease-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${getColor(score).split(' ')[0]}`}>
            {score}
          </span>
          <span className="text-xs text-zinc-500">/ 100</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-zinc-600">{label}</span>
    </div>
  );
}

// Plan Option Card
function PlanOptionCard({ plan, selected, onSelect }) {
  const tierColors = {
    basic: 'border-zinc-200 hover:border-zinc-300',
    standard: 'border-blue-200 hover:border-blue-300',
    premium: 'border-amber-200 hover:border-amber-300',
  };

  const tierBgColors = {
    basic: 'bg-zinc-50',
    standard: 'bg-blue-50',
    premium: 'bg-amber-50',
  };

  return (
    <div
      onClick={onSelect}
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all
        ${tierColors[plan.tier] || 'border-zinc-200'}
        ${selected ? 'ring-2 ring-[#0055FF] ring-offset-2' : ''}
        ${selected ? tierBgColors[plan.tier] || 'bg-zinc-50' : 'bg-white'}
      `}
    >
      {plan.recommended && (
        <Badge className="absolute -top-2 right-2 bg-[#0055FF] text-white text-xs">
          Recommended
        </Badge>
      )}
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold capitalize">{plan.tier}</span>
        {selected && <CheckCircle className="w-5 h-5 text-[#0055FF]" />}
      </div>
      <div className="mb-3">
        <span className="text-2xl font-bold">₹{plan.premium?.toLocaleString('en-IN') || 0}</span>
        <span className="text-sm text-zinc-500">/year</span>
      </div>
      <ul className="space-y-1.5">
        {plan.features?.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-zinc-600">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Stats Card Skeleton
function StatsCardSkeleton() {
  return (
    <Card className="border border-zinc-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Table Row Skeleton
function TableRowSkeleton({ columns = 6 }) {
  return (
    <TableRow>
      {Array.from({ length: columns }).map((_, idx) => (
        <TableCell key={idx}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export default function UnderwritingHubPage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterColumn, setFilterColumn] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState('standard');
  const [underwriterNotes, setUnderwriterNotes] = useState('');
  const [expandedSection, setExpandedSection] = useState('intelligence');
  const [activeTab, setActiveTab] = useState('data');

  useEffect(() => {
    fetchCase();
  }, [caseId]);

  const fetchCase = async () => {
    try {
      setLoading(true);
      const { data } = await casesApi.getById(caseId);
      setCaseData(data);
      setUnderwriterNotes(data.underwriter_notes || '');
      
      // Load underwriting summary if available
      if (data.underwriting_summary) {
        const riskScore = data.underwriting_summary.risk_profile?.risk_score || 50;
        if (riskScore >= 70) setSelectedPlan('basic');
        else if (riskScore >= 40) setSelectedPlan('standard');
        else setSelectedPlan('premium');
        setUnderwriterNotes(data.underwriting_summary.underwriting_notes || '');
      }
    } catch (error) {
      toast.error('Failed to load case');
      navigate('/underwriter/queue');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateAnalysis = async () => {
    setAnalyzing(true);
    try {
      const { data } = await casesApi.regenerateUnderwritingSummary(caseId);
      setCaseData(prev => ({ ...prev, underwriting_summary: data.underwriting_summary }));
      toast.success('Underwriting analysis regenerated');
    } catch (error) {
      toast.error('Failed to regenerate analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApprove = async () => {
    try {
      await casesApi.makeDecision(caseId, {
        decision: 'approve',
        notes: underwriterNotes,
        selected_plan: selectedPlan,
      });
      toast.success('Case approved successfully');
      navigate('/underwriter/queue');
    } catch (error) {
      toast.error('Failed to approve case');
    }
  };

  const handleRequestChanges = async () => {
    try {
      await casesApi.makeDecision(caseId, {
        decision: 'request_fixes',
        notes: underwriterNotes,
      });
      toast.success('Changes requested');
      navigate('/underwriter/queue');
    } catch (error) {
      toast.error('Failed to request changes');
    }
  };

  const handleDownloadQuotation = async () => {
    try {
      toast.info('Generating quotation...');
      const { data } = await casesApi.generateQuotation(caseId, selectedPlan);
      toast.success(`Quotation generated: ${data.quotation_id}`);
    } catch (error) {
      toast.error('Failed to generate quotation');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Filter and search table data
  const filteredData = useMemo(() => {
    let data = caseData?.corrected_data || caseData?.mapped_data || [];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter(row => 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(query)
        )
      );
    }
    
    if (filterColumn !== 'all') {
      data = data.filter(row => 
        String(row[filterColumn]).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return data;
  }, [caseData, searchQuery, filterColumn]);

  const tableColumns = useMemo(() => {
    const data = caseData?.corrected_data || caseData?.mapped_data || [];
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter(k => !k.startsWith('_'));
  }, [caseData]);

  const uwSummary = caseData?.underwriting_summary;
  const keyStats = uwSummary?.key_stats || {};
  const riskProfile = uwSummary?.risk_profile || {};
  const premiumCalc = uwSummary?.premium_calculation || {};
  const planOptionsData = uwSummary?.plan_options || [];

  const riskScore = riskProfile.risk_score || keyStats.risk_band ? 50 : 50;
  const memberCount = filteredData.length || keyStats.total_members || caseData?.member_count || 0;
  const sumInsured = keyStats.total_sum_insured || caseData?.sum_insured || 0;

  // Use AI-generated plan options, fallback to calculated
  const planOptions = planOptionsData.length > 0
    ? planOptionsData.map((p, i) => ({
        tier: p.name?.toLowerCase() || ['basic', 'standard', 'premium'][i],
        premium: p.premium || 0,
        coverage: p.coverage || '',
        features: p.features || [],
        recommended: i === 1,
      }))
    : [
        { tier: 'basic', premium: Math.round(sumInsured * 0.05), recommended: riskScore >= 70, features: ['Core hospitalization', 'Day care procedures', 'Ambulance cover'] },
        { tier: 'standard', premium: Math.round(sumInsured * 0.08), recommended: riskScore >= 40 && riskScore < 70, features: ['Above + Maternity', 'OPD coverage', 'Mental health', 'Reproduction benefits'] },
        { tier: 'premium', premium: Math.round(sumInsured * 0.12), recommended: riskScore < 40, features: ['Above + Dental', 'Wellness', 'International second opinion', 'Zero co-pay'] },
      ];

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>

          {/* Stats Strip Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>

          {/* Table Skeleton */}
          <Card className="border border-zinc-200">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} columns={6} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <Link 
              to="/underwriter/queue" 
              className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Queue
            </Link>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold font-['Chivo'] tracking-tight text-zinc-900">
                {caseData?.case_id}
              </h1>
              <Badge className="bg-cyan-50 text-cyan-700">
                <Clock className="w-3 h-3 mr-1" />
                Under Review
              </Badge>
            </div>
            <p className="text-zinc-500">
              {caseData?.client_name} • Submitted by {caseData?.agent_name}
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateAnalysis}
              disabled={analyzing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Regenerate Analysis</span>
              <span className="sm:hidden">Regenerate</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadQuotation}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Quotation PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRequestChanges}
              className="border-orange-200 text-orange-700 hover:bg-orange-50 gap-2"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Request Changes</span>
              <span className="sm:hidden">Changes</span>
            </Button>
            <Button
              size="sm"
              onClick={handleApprove}
              className="bg-emerald-600 hover:bg-emerald-700 gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </Button>
          </div>
        </div>

        {/* KEY STATS STRIP - Mobile Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          <Card className="border border-zinc-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-xl font-bold font-['Chivo'] truncate">
                    {memberCount}
                  </p>
                  <p className="text-xs text-zinc-500 hidden sm:block">Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-bold font-['Chivo'] truncate">
                    {formatCurrency(sumInsured)}
                  </p>
                  <p className="text-xs text-zinc-500 hidden sm:block">Sum Insured</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-bold font-['Chivo'] truncate">
                    {caseData?.policy_type || 'Standard'}
                  </p>
                  <p className="text-xs text-zinc-500 hidden sm:block">Policy Type</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-xl font-bold font-['Chivo']">
                    {riskScore}%
                  </p>
                  <p className="text-xs text-zinc-500 hidden sm:block">AI Confidence</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-red-50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-xl font-bold font-['Chivo']">
                    {aiAnalysis.flags_count || caseData?.risk_flags?.length || 0}
                  </p>
                  <p className="text-xs text-zinc-500 hidden sm:block">Risk Flags</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-indigo-50 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-bold font-['Chivo']">
                    {formatDate(caseData?.submitted_at)}
                  </p>
                  <p className="text-xs text-zinc-500 hidden sm:block">Submitted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Flags Alert */}
        {caseData?.risk_flags?.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800 mb-1">Risk Flags Detected</p>
                  <div className="flex flex-wrap gap-2">
                    {caseData.risk_flags.map((flag, idx) => (
                      <Badge key={idx} variant="outline" className="border-orange-300 text-orange-700 bg-white">
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Data Table (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tab Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1 bg-zinc-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('data')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'data'
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Member Data
                </button>
                <button
                  onClick={() => setActiveTab('coverage')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'coverage'
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Coverage
                </button>
              </div>

              {activeTab === 'data' && (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-40 sm:w-60 h-8"
                    />
                  </div>
                  <Select value={filterColumn} onValueChange={setFilterColumn}>
                    <SelectTrigger className="w-32 h-8">
                      <Filter className="w-4 h-4 mr-1" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Columns</SelectItem>
                      {tableColumns.slice(0, 5).map(col => (
                        <SelectItem key={col} value={col}>
                          {col.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {activeTab === 'data' ? (
              <Card className="border border-zinc-200">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-zinc-50/50">
                          {tableColumns.slice(0, 8).map(col => (
                            <TableHead key={col} className="whitespace-nowrap text-xs uppercase tracking-wide">
                              {col.replace(/_/g, ' ')}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-zinc-500">
                              No data found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredData.slice(0, 50).map((row, idx) => (
                            <TableRow key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/30'}>
                              {tableColumns.slice(0, 8).map(col => (
                                <TableCell key={col} className="text-sm whitespace-nowrap">
                                  {String(row[col] ?? '-')}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {filteredData.length > 50 && (
                    <div className="p-3 border-t border-zinc-200 text-center text-sm text-zinc-500">
                      Showing 50 of {filteredData.length} records
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-zinc-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold font-['Chivo']">Coverage Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-zinc-500 uppercase tracking-wide">Policy Details</h4>
                      <div className="space-y-2">
                        {[
                          { label: 'Policy Type', value: caseData?.policy_type },
                          { label: 'Total Members', value: memberCount },
                          { label: 'Total Sum Insured', value: formatCurrency(sumInsured) },
                          { label: 'Policy Period', value: '12 Months' },
                        ].map(item => (
                          <div key={item.label} className="flex justify-between py-2 border-b border-zinc-100">
                            <span className="text-zinc-500">{item.label}</span>
                            <span className="font-medium">{item.value || '-'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-zinc-500 uppercase tracking-wide">Risk Assessment</h4>
                      <div className="space-y-2">
                        {[
                          { label: 'AI Confidence', value: `${riskScore}%`, trend: riskScore >= 80 ? 'up' : 'down' },
                          { label: 'Data Quality', value: riskScore >= 80 ? 'Excellent' : riskScore >= 60 ? 'Good' : 'Needs Review' },
                          { label: 'Risk Level', value: riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low' },
                          { label: 'Manual Review', value: riskScore >= 60 ? 'Not Required' : 'Recommended' },
                        ].map(item => (
                          <div key={item.label} className="flex justify-between py-2 border-b border-zinc-100">
                            <span className="text-zinc-500">{item.label}</span>
                            <span className={`font-medium flex items-center gap-1 ${
                              item.trend === 'up' ? 'text-emerald-600' : item.trend === 'down' ? 'text-red-600' : ''
                            }`}>
                              {item.value}
                              {item.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                              {item.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Underwriting Intelligence (1/3 width) */}
          <div className="space-y-4">
            {/* Risk Gauge Card */}
            <Card className="border border-zinc-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold font-['Chivo'] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#0055FF]" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-4">
                <RiskGauge score={riskScore} />
              </CardContent>
              <CardFooter className="pt-0 justify-center">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Low Risk</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>High</span>
                  </div>
                </div>
              </CardFooter>
            </Card>

            {/* Premium Calculation Card */}
            <Card className="border border-zinc-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold font-['Chivo'] flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Premium Calculation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-zinc-50 rounded-lg">
                    <p className="text-2xl font-bold font-['Chivo'] text-zinc-900">
                      {formatCurrency(sumInsured)}
                    </p>
                    <p className="text-xs text-zinc-500">Base Sum Insured</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <p className="text-2xl font-bold font-['Chivo'] text-emerald-600">
                      {formatCurrency(aiAnalysis.recommended_premium || Math.round(sumInsured * 0.08))}
                    </p>
           <p className="text-xs text-zinc-500">Recommended Premium</p>
                  </div>
                </div>
                <div className="text-xs text-zinc-500 flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Premium calculated based on risk assessment and coverage requirements</span>
                </div>
              </CardContent>
            </Card>

            {/* Plan Options Card */}
            <Card className="border border-zinc-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold font-['Chivo'] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  Plan Options
                </CardTitle>
                <CardDescription className="text-xs">
                  Select a coverage tier for this case
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {planOptions.map((plan) => (
                  <PlanOptionCard
                    key={plan.tier}
                    plan={plan}
                    selected={selectedPlan === plan.tier}
                    onSelect={() => setSelectedPlan(plan.tier)}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Underwriter Notes Card */}
            <Card className="border border-zinc-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold font-['Chivo']">
                    Underwriter Notes
                  </CardTitle>
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'notes' ? '' : 'notes')}
                    className="p-1 hover:bg-zinc-100 rounded"
                  >
                    {expandedSection === 'notes' ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </CardHeader>
              {expandedSection === 'notes' && (
                <CardContent>
                  <Textarea
                    placeholder="Add notes for this case..."
                    value={underwriterNotes}
                    onChange={(e) => setUnderwriterNotes(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-zinc-500 mt-2">
                    These notes will be saved with the case and visible to reviewers.
                  </p>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}