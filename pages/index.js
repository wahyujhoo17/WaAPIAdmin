import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import {
    User,
    QrCode,
    LogOut,
    Plus,
    Users,
    X,
    Activity,
    Shield,
    MessageSquare,
    TrendingUp,
    Settings,
    BarChart3,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    EyeOff,
    Edit,
    Trash2,
    RefreshCw,
    AlertCircle,
    Info
} from 'lucide-react'; export default function Home() {
    const [users, setUsers] = useState([]);
    const [session, setSession] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editEmail, setEditEmail] = useState('');
    const [editWhatsappNumber, setEditWhatsappNumber] = useState('');
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeConnections: 0,
        messagesDay: 156,
        uptime: '99.9%'
    });
    const [healthStatus, setHealthStatus] = useState([]);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [selectedUserQr, setSelectedUserQr] = useState(null);
    const [userQrCode, setUserQrCode] = useState('');
    const [userQrLoading, setUserQrLoading] = useState({});
    const [connectionStatus, setConnectionStatus] = useState({}); // Track connection status per user
    const [showApiKey, setShowApiKey] = useState(false); // State for API Key visibility
    const [isAuthLoading, setIsAuthLoading] = useState(true); // Loading state for authentication

    // Alert modal state
    const [alert, setAlert] = useState({
        show: false,
        type: 'info', // 'success', 'error', 'warning', 'info'
        title: '',
        message: '',
        autoClose: true,
        onConfirm: null,
        onCancel: null,
        confirmText: 'OK',
        cancelText: 'Cancel',
        showCancel: false
    });

    const router = useRouter();

    // Alert helper functions
    const showAlert = (type, title, message, options = {}) => {
        setAlert({
            show: true,
            type,
            title,
            message,
            autoClose: options.autoClose !== false,
            onConfirm: options.onConfirm || null,
            onCancel: options.onCancel || null,
            confirmText: options.confirmText || 'OK',
            cancelText: options.cancelText || 'Cancel',
            showCancel: options.showCancel || false
        });

        // Auto close after 5 seconds if enabled
        if (options.autoClose !== false) {
            setTimeout(() => {
                setAlert(prev => ({ ...prev, show: false }));
            }, 5000);
        }
    };

    const showSuccess = (title, message, options = {}) => {
        showAlert('success', title, message, options);
    };

    const showError = (title, message, options = {}) => {
        showAlert('error', title, message, options);
    };

    const showWarning = (title, message, options = {}) => {
        showAlert('warning', title, message, options);
    };

    const showInfo = (title, message, options = {}) => {
        showAlert('info', title, message, options);
    };

    const showConfirm = (title, message, onConfirm, onCancel = null) => {
        showAlert('warning', title, message, {
            autoClose: false,
            showCancel: true,
            onConfirm,
            onCancel,
            confirmText: 'Yes',
            cancelText: 'No'
        });
    };

    const closeAlert = () => {
        setAlert(prev => ({ ...prev, show: false }));
    };

    const handleAlertConfirm = () => {
        if (alert.onConfirm) {
            alert.onConfirm();
        }
        closeAlert();
    };

    const handleAlertCancel = () => {
        if (alert.onCancel) {
            alert.onCancel();
        }
        closeAlert();
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                router.push('/login');
                return;
            }
            setSession(session);
            setIsAuthLoading(false);
            fetchUsers();
            fetchStats();
            fetchHealth();
            // fetchAllQrCodes(); // Temporarily disabled due to backend endpoint issue
            // fetchQrCode(); // Removed - use user-specific QR codes instead
        });

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.push('/login');
            } else {
                setSession(session);
                setIsAuthLoading(false);
            }
        });

        return () => authListener.subscription.unsubscribe();
    }, [router]);

    useEffect(() => {
        // QR code akan dimuat saat component pertama kali load
        // Tidak perlu menunggu users
    }, [users]);

    // Monitor connection status changes and auto-close modal on success
    useEffect(() => {
        if (selectedUserQr && connectionStatus[selectedUserQr.id] === 'connected' && isQrModalOpen) {
            // Auto-close modal and show success alert
            setIsQrModalOpen(false);
            showSuccess('WhatsApp Connected', `✅ Berhasil menghubungkan WhatsApp untuk ${selectedUserQr.email}!`);

            // Reset connection status
            setConnectionStatus(prev => ({
                ...prev,
                [selectedUserQr.id]: null
            }));

            // Refresh users list to update connection status
            fetchUsers();
        }
    }, [connectionStatus, selectedUserQr, isQrModalOpen]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/users`);
            const result = await response.json();

            if (!response.ok) {
                console.error('Error fetching users:', result.error);
                return;
            }

            setUsers(result.users || []);
        } catch (err) {
            console.error('Fetch users error:', err);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/stats`);
            const result = await response.json();

            if (!response.ok) {
                console.error('Error fetching stats:', result.error);
                return;
            }

            setStats(result);
        } catch (err) {
            console.error('Fetch stats error:', err);
        }
    };

    const fetchHealth = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/health`);
            const result = await response.json();

            if (!response.ok) {
                console.error('Error fetching health:', result.error);
                return;
            }

            setHealthStatus(result.services || []);
        } catch (err) {
            console.error('Fetch health error:', err);
        }
    };

    const openQrModal = (user) => {
        setSelectedUserQr(user);
        setIsQrModalOpen(true);

        // Set initial connection status based on user's current connection state
        setConnectionStatus(prev => ({
            ...prev,
            [user.id]: user.whatsapp_connected ? 'connected' : 'waiting'
        }));

        // Always generate new QR code when opening modal
        generateUserQrCode(user.id);
    };

    const generateUserQrCode = async (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        setUserQrLoading(prev => ({ ...prev, [userId]: true }));
        setSelectedUserQr(user);
        setUserQrCode('');

        // Set initial status to scanning
        setConnectionStatus(prev => ({
            ...prev,
            [userId]: 'scanning'
        }));

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

            const response = await fetch(`${backendUrl}/admin/qr/${userId}`);

            const result = await response.json();

            if (!response.ok) {
                console.error('Error generating QR code:', result.error);
                showError('QR Generation Error', `Error: ${result.error}`);
                setConnectionStatus(prev => ({
                    ...prev,
                    [userId]: 'waiting'
                }));
                return;
            }

            setUserQrCode(result.qr);

            // Update status to indicate QR is ready for scanning
            setConnectionStatus(prev => ({
                ...prev,
                [userId]: 'scanning'
            }));

            // Start polling for connection status
            const pollConnectionStatus = async () => {
                let attempts = 0;
                const maxAttempts = 60; // 60 attempts = 30 seconds (500ms * 60)

                const poll = async () => {
                    if (attempts >= maxAttempts) {
                        setConnectionStatus(prev => ({
                            ...prev,
                            [userId]: 'timeout'
                        }));
                        return;
                    }

                    try {
                        // Check if user is connected by fetching updated user data
                        const usersResponse = await fetch(`${backendUrl}/admin/users`);
                        const usersResult = await usersResponse.json();

                        if (usersResult.users) {
                            const updatedUser = usersResult.users.find(u => u.id === userId);
                            if (updatedUser && updatedUser.whatsapp_connected) {
                                setConnectionStatus(prev => ({
                                    ...prev,
                                    [userId]: 'connected'
                                }));
                                return;
                            }
                        }

                        // Update status to connecting after some attempts
                        if (attempts > 5 && connectionStatus[userId] === 'scanning') {
                            setConnectionStatus(prev => ({
                                ...prev,
                                [userId]: 'connecting'
                            }));
                        }

                        attempts++;
                        setTimeout(poll, 500); // Check every 500ms
                    } catch (error) {
                        console.error('Error polling connection status:', error);
                        attempts++;
                        setTimeout(poll, 500);
                    }
                };

                // Start polling after a short delay
                setTimeout(poll, 1000);
            };

            pollConnectionStatus();

            // Refresh all QR codes list
            // await fetchAllQrCodes(); // Temporarily disabled
        } catch (err) {
            console.error('Generate QR code error:', err);
            showError('QR Generation Failed', `Failed to generate QR code: ${err.message}`);
            setConnectionStatus(prev => ({
                ...prev,
                [userId]: 'waiting'
            }));
        } finally {
            setUserQrLoading(prev => ({ ...prev, [userId]: false }));
        }
    };



    const generateApiKey = async () => {
        if (!email || !whatsappNumber) {
            showWarning('Form Incomplete', 'Please fill all fields');
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/generate-api-key`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, whatsappNumber }),
            });
            const data = await response.json();
            if (data.apiKey) {
                showSuccess(
                    'Berhasil',
                    'Akun baru berhasil dibuat. Pengguna telah ditambahkan dan perubahan disimpan. Silakan cek daftar pengguna untuk melihat detail dan status koneksi.',
                    { autoClose: true }
                );
                setIsModalOpen(false);
                setEmail('');
                setWhatsappNumber('');
                fetchUsers();
            }
        } catch (error) {
            console.error('Error generating API key:', error);
            showError('API Key Error', 'Error generating API key');
        } finally {
            setIsLoading(false);
        }
    };

    const editUser = async () => {
        if (!editEmail || !editWhatsappNumber) {
            showWarning('Form Incomplete', 'Please fill all fields');
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: editEmail, whatsappNumber: editWhatsappNumber }),
            });
            const data = await response.json();
            if (response.ok) {
                showSuccess('User Updated', 'User updated successfully');
                setIsEditModalOpen(false);
                setSelectedUser(null);
                fetchUsers();
            } else {
                showError('Update Error', 'Error updating user: ' + data.error);
            }
        } catch (error) {
            console.error('Error updating user:', error);
            showError('Update Error', 'Error updating user');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteUser = async (userId) => {
        showConfirm(
            'Delete User',
            'Are you sure you want to delete this user? This action cannot be undone.',
            () => {
                performDeleteUser(userId);
            }
        );
    };

    const performDeleteUser = async (userId) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/users/${userId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                showSuccess('User Deleted', 'User deleted successfully');
                fetchUsers();
            } else {
                const data = await response.json();
                showError('Delete Error', 'Error deleting user: ' + data.error);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showError('Delete Error', 'Error deleting user');
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
            } catch (err) {
                showError('Copy Failed', 'Failed to copy to clipboard');
            }
            document.body.removeChild(textArea);
        }
    };

    const openDetailModal = (user) => {
        setSelectedUser(user);
        setIsDetailModalOpen(true);
        setShowApiKey(false); // Reset API Key visibility when opening modal
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setEditEmail(user.email);
        setEditWhatsappNumber(user.whatsapp_number);
        setIsEditModalOpen(true);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.whatsapp_number?.includes(searchTerm)
    );

    // Alert Modal Component
    const AlertModal = () => {
        if (!alert.show) return null;

        // Handle keyboard events
        useEffect(() => {
            const handleKeyDown = (event) => {
                if (event.key === 'Escape') {
                    if (alert.showCancel) {
                        handleAlertCancel();
                    } else {
                        closeAlert();
                    }
                }
            };

            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }, [alert.show, alert.showCancel]);

        const getAlertIcon = () => {
            switch (alert.type) {
                case 'success':
                    return <CheckCircle className="w-6 h-6 text-green-500" />;
                case 'error':
                    return <XCircle className="w-6 h-6 text-red-500" />;
                case 'warning':
                    return <AlertCircle className="w-6 h-6 text-yellow-500" />;
                case 'info':
                default:
                    return <Info className="w-6 h-6 text-blue-500" />;
            }
        };

        const getAlertColors = () => {
            switch (alert.type) {
                case 'success':
                    return {
                        bg: 'bg-green-50',
                        border: 'border-green-200',
                        title: 'text-green-800',
                        message: 'text-green-700',
                        button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    };
                case 'error':
                    return {
                        bg: 'bg-red-50',
                        border: 'border-red-200',
                        title: 'text-red-800',
                        message: 'text-red-700',
                        button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    };
                case 'warning':
                    return {
                        bg: 'bg-yellow-50',
                        border: 'border-yellow-200',
                        title: 'text-yellow-800',
                        message: 'text-yellow-700',
                        button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                    };
                case 'info':
                default:
                    return {
                        bg: 'bg-blue-50',
                        border: 'border-blue-200',
                        title: 'text-blue-800',
                        message: 'text-blue-700',
                        button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                    };
            }
        };

        const colors = getAlertColors();

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ease-out ${alert.show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                    {/* Header */}
                    <div className={`px-6 py-4 border-b ${colors.border} ${colors.bg} rounded-t-2xl`}>
                        <div className="flex items-center space-x-3">
                            {getAlertIcon()}
                            <h3 className={`text-lg font-semibold ${colors.title}`}>
                                {alert.title}
                            </h3>
                            <button
                                onClick={closeAlert}
                                className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6">
                        <p className={`text-sm ${colors.message} leading-relaxed`}>
                            {alert.message}
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
                        {alert.showCancel && (
                            <button
                                onClick={handleAlertCancel}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm font-medium"
                            >
                                {alert.cancelText}
                            </button>
                        )}
                        <button
                            onClick={handleAlertConfirm}
                            autoFocus={true}
                            className={`px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-sm font-medium ${colors.button}`}
                        >
                            {alert.confirmText}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Show loading screen while checking authentication
    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                            <MessageSquare className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">WhatsApp API</h2>
                    <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-gray-600">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                                    <MessageSquare className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">WhatsApp API</h1>
                                    <p className="text-sm text-gray-500">Admin Dashboard</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-green-100 rounded-full">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-green-700 font-medium">Online</span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{session?.user?.email}</p>
                                <p className="text-xs text-gray-500">Administrator</p>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                                <div className="flex items-center mt-1">
                                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                    <span className="text-sm text-green-600">+12%</span>
                                </div>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Connections</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.activeConnections}</p>
                                <div className="flex items-center mt-1">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                                    <span className="text-sm text-green-600">Connected</span>
                                </div>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Activity className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Messages Today</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.messagesDay}</p>
                                <div className="flex items-center mt-1">
                                    <Clock className="w-4 h-4 text-blue-500 mr-1" />
                                    <span className="text-sm text-blue-600">Last hour: 23</span>
                                </div>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <MessageSquare className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.uptime}</p>
                                <div className="flex items-center mt-1">
                                    <Shield className="w-4 h-4 text-green-500 mr-1" />
                                    <span className="text-sm text-green-600">Healthy</span>
                                </div>
                            </div>
                            <div className="p-3 bg-emerald-100 rounded-lg">
                                <BarChart3 className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* User Management Section */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Generate API Key
                                </button>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">User Management</h3>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                                        />
                                        <User className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WhatsApp</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredUsers.length > 0 ? filteredUsers.map((user, index) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                                                                <User className="w-5 h-5 text-white" />
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{user.email}</div>
                                                            <div className="text-sm text-gray-500">User #{index + 1}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{user.whatsapp_number}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.whatsapp_connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {user.whatsapp_connected ? 'Connected' : 'Disconnected'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.whatsapp_connected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {user.whatsapp_connected ? 'QR Connected' : 'QR Required'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => openDetailModal(user)}
                                                            className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded text-xs font-medium bg-blue-50 hover:bg-blue-100 transition-colors"
                                                        >
                                                            Detail
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(user)}
                                                            className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded text-xs font-medium bg-indigo-50 hover:bg-indigo-100 transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => openQrModal(user)}
                                                            disabled={userQrLoading[user.id]}
                                                            className="text-green-600 hover:text-green-900 px-2 py-1 rounded text-xs font-medium bg-green-50 hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center"
                                                        >
                                                            {userQrLoading[user.id] ? (
                                                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                                            ) : (
                                                                <QrCode className="w-3 h-3 mr-1" />
                                                            )}
                                                            QR
                                                        </button>
                                                        <button
                                                            onClick={() => deleteUser(user.id)}
                                                            className="text-red-600 hover:text-red-900 px-2 py-1 rounded text-xs font-medium bg-red-50 hover:bg-red-100 transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <Users className="w-12 h-12 text-gray-400 mb-4" />
                                                        <p className="text-gray-500">No users found</p>
                                                        <p className="text-sm text-gray-400">Create your first API key to get started</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-900">System Status</h3>
                            <div className="flex items-center space-x-1">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-medium text-green-600">Operational</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {healthStatus.length > 0 ? (
                                healthStatus.map((service, index) => (
                                    <div key={index} className="group relative bg-gradient-to-r from-gray-50 to-gray-100 rounded-md p-3 border border-gray-200 hover:shadow-sm transition-all duration-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="text-xs font-medium text-gray-900">{service.name}</h4>
                                                {service.responseTime && (
                                                    <span className="text-xs text-gray-500">
                                                        {service.responseTime}ms
                                                    </span>
                                                )}
                                            </div>
                                            {service.status === 'healthy' ? (
                                                <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-green-100 rounded-full">
                                                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                                    <span className="text-xs font-medium text-green-700">Online</span>
                                                </div>
                                            ) : service.status === 'warning' ? (
                                                <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-yellow-100 rounded-full">
                                                    <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                                                    <span className="text-xs font-medium text-yellow-700">Warning</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-red-100 rounded-full">
                                                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                                    <span className="text-xs font-medium text-red-700">Offline</span>
                                                </div>
                                            )}
                                        </div>
                                        {service.details && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {service.details}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <>
                                    <div className="group relative bg-gradient-to-r from-green-50 to-emerald-50 rounded-md p-3 border border-green-200 hover:shadow-sm transition-all duration-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="text-xs font-medium text-gray-900">API Server</h4>
                                                <span className="text-xs text-gray-500">&lt;50ms</span>
                                            </div>
                                            <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-green-100 rounded-full">
                                                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="text-xs font-medium text-green-700">Online</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group relative bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md p-3 border border-blue-200 hover:shadow-sm transition-all duration-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="text-xs font-medium text-gray-900">Database</h4>
                                                <span className="text-xs text-gray-500">PostgreSQL</span>
                                            </div>
                                            <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-blue-100 rounded-full">
                                                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                                                <span className="text-xs font-medium text-blue-700">Connected</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group relative bg-gradient-to-r from-purple-50 to-violet-50 rounded-md p-3 border border-purple-200 hover:shadow-sm transition-all duration-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="text-xs font-medium text-gray-900">WhatsApp</h4>
                                                <span className="text-xs text-gray-500">
                                                    {stats.activeConnections} conn{stats.activeConnections !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-purple-100 rounded-full">
                                                <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse"></div>
                                                <span className="text-xs font-medium text-purple-700">Active</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Enhanced Modal for Generate API Key */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Generate API Key</h3>
                                <p className="text-sm text-gray-500 mt-1">Create a new user account with API access</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="user@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                                <input
                                    type="text"
                                    value={whatsappNumber}
                                    onChange={(e) => setWhatsappNumber(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="6281234567890"
                                />
                                <p className="text-xs text-gray-500 mt-1">Include country code (e.g., 62 for Indonesia)</p>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end space-x-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={generateApiKey}
                                disabled={isLoading || !email || !whatsappNumber}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Generate API Key
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Detail Modal */}
            {isDetailModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                                <p className="text-sm text-gray-500 mt-1">Complete information for {selectedUser.email}</p>
                            </div>
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                                    <div className="flex items-center space-x-2">
                                        <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono text-gray-800 break-all">
                                            {selectedUser.id}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(selectedUser.id)}
                                            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                                            title="Copy User ID"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <div className="px-3 py-2 bg-gray-100 rounded text-sm text-gray-800">
                                        {selectedUser.email}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                                    <div className="px-3 py-2 bg-gray-100 rounded text-sm text-gray-800">
                                        {selectedUser.whatsapp_number || 'Not set'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
                                    <div className="px-3 py-2 bg-gray-100 rounded text-sm text-gray-800">
                                        {new Date(selectedUser.created_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                                <div className="flex items-center space-x-2">
                                    <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono text-gray-800 break-all">
                                        {showApiKey ? selectedUser.api_key : '•'.repeat(selectedUser.api_key?.length || 32)}
                                    </code>
                                    <button
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                                        title={showApiKey ? "Hide API Key" : "Show API Key"}
                                    >
                                        {showApiKey ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(selectedUser.api_key)}
                                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                                        title="Copy API Key"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Use this key to authenticate API requests</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Server URL</label>
                                <div className="flex items-center space-x-2">
                                    <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono text-gray-800 break-all">
                                        {process.env.NEXT_PUBLIC_BACKEND_URL}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(process.env.NEXT_PUBLIC_BACKEND_URL)}
                                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                                        title="Copy Server URL"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Base URL for API endpoints</p>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User QR Code Modal */}
            {isQrModalOpen && selectedUserQr && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">WhatsApp QR Code</h3>
                                <p className="text-sm text-gray-500 mt-1">For user: {selectedUserQr.email}</p>
                            </div>
                            <button
                                onClick={() => setIsQrModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="flex flex-col items-center">
                            {userQrLoading[selectedUserQr.id] ? (
                                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <p className="text-sm text-gray-600 mt-4">Generating QR Code...</p>
                                </div>
                            ) : userQrCode ? (
                                <div className="relative">
                                    <img
                                        src={`data:image/png;base64,${userQrCode}`}
                                        alt="QR Code"
                                        className="w-48 h-48 rounded-lg border border-gray-200"
                                    />
                                    <div className="absolute -top-2 -right-2">
                                        <div className={`w-4 h-4 rounded-full border-2 border-white ${selectedUserQr.whatsapp_connected ? 'bg-green-500' : 'bg-yellow-500'
                                            }`}></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-48 h-48 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                                    <QrCode className="w-12 h-12 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500 text-center">No QR code available</p>
                                    <button
                                        onClick={() => generateUserQrCode(selectedUserQr.id)}
                                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        Generate QR Code
                                    </button>
                                </div>
                            )}
                            <div className="mt-4 text-center">
                                <p className="text-sm text-gray-600 mb-2">
                                    {selectedUserQr.whatsapp_connected ?
                                        'WhatsApp is connected and ready!' :
                                        connectionStatus[selectedUserQr.id] === 'scanning' ?
                                            'Please scan the QR code with WhatsApp' :
                                            connectionStatus[selectedUserQr.id] === 'connecting' ?
                                                'Connecting to WhatsApp...' :
                                                connectionStatus[selectedUserQr.id] === 'timeout' ?
                                                    'Connection timeout. Please try again.' :
                                                    'Scan with WhatsApp to connect this user'
                                    }
                                </p>
                                <div className="flex items-center justify-center space-x-2 text-xs">
                                    {connectionStatus[selectedUserQr.id] === 'scanning' && (
                                        <>
                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                            <span className="text-blue-600 font-medium">Scanning...</span>
                                        </>
                                    )}
                                    {connectionStatus[selectedUserQr.id] === 'connecting' && (
                                        <>
                                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"></div>
                                            <span className="text-orange-600 font-medium">Connecting...</span>
                                        </>
                                    )}
                                    {connectionStatus[selectedUserQr.id] === 'timeout' && (
                                        <>
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            <span className="text-red-600 font-medium">Timeout</span>
                                        </>
                                    )}
                                    {(!connectionStatus[selectedUserQr.id] || connectionStatus[selectedUserQr.id] === 'waiting') && !selectedUserQr.whatsapp_connected && (
                                        <>
                                            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                                            <span className="text-yellow-600 font-medium">Waiting for scan</span>
                                        </>
                                    )}
                                    {selectedUserQr.whatsapp_connected && (
                                        <>
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="text-green-600 font-medium">Connected</span>
                                        </>
                                    )}
                                </div>
                                {connectionStatus[selectedUserQr.id] === 'scanning' && (
                                    <div className="mt-2">
                                        <div className="w-full bg-gray-200 rounded-full h-1">
                                            <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Checking connection status...</p>
                                    </div>
                                )}
                                {connectionStatus[selectedUserQr.id] === 'connecting' && (
                                    <div className="mt-2">
                                        <div className="w-full bg-gray-200 rounded-full h-1">
                                            <div className="bg-orange-500 h-1 rounded-full animate-pulse" style={{ width: '80%' }}></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Establishing connection...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end space-x-3">
                            <button
                                onClick={() => generateUserQrCode(selectedUserQr.id)}
                                disabled={userQrLoading[selectedUserQr.id]}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center text-sm"
                            >
                                {userQrLoading[selectedUserQr.id] ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Regenerate QR
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setIsQrModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
                                <p className="text-sm text-gray-500 mt-1">Update user information</p>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="user@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                                <input
                                    type="text"
                                    value={editWhatsappNumber}
                                    onChange={(e) => setEditWhatsappNumber(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="6281234567890"
                                />
                                <p className="text-xs text-gray-500 mt-1">Include country code (e.g., 62 for Indonesia)</p>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end space-x-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={editUser}
                                disabled={isLoading || !editEmail || !editWhatsappNumber}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Update User
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Alert Modal */}
            <AlertModal />
        </div>
    );
}