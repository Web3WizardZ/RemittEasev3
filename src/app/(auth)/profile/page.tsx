import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { User, Lock, Activity, Settings, Shield, CreditCard, Phone, Mail, Eye, EyeOff } from 'lucide-react';

const ProfileManagement = () => {
  const [showSeed, setShowSeed] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    currency: "USD",
    walletAddress: "0x1234...5678",
    walletSeed: "word1 word2 word3 word4 ... word12",
    monthlyVolume: 5678.90,
    transactionCount: 45,
    securityLevel: "High"
  });

  const [transactionStats] = useState({
    monthly: [
      { month: 'Jan', sent: 1500, received: 2000 },
      { month: 'Feb', sent: 2200, received: 1800 },
      { month: 'Mar', sent: 1800, received: 2500 },
      { month: 'Apr', sent: 2400, received: 2100 },
      { month: 'May', sent: 2000, received: 2800 },
      { month: 'Jun', sent: 2600, received: 2300 }
    ],
    currencies: [
      { name: 'USD', volume: 8500 },
      { name: 'EUR', volume: 6200 },
      { name: 'GBP', volume: 4300 },
      { name: 'ZAR', volume: 3800 },
      { name: 'NGN', volume: 2900 }
    ]
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <Input value={profileData.name} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Address
                      </label>
                      <Input value={profileData.email} type="email" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Phone Number
                      </label>
                      <Input value={profileData.phone} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <CreditCard className="w-4 h-4 inline mr-2" />
                        Preferred Currency
                      </label>
                      <Input value={profileData.currency} disabled />
                    </div>
                  </div>
                  <Button className="mt-4">Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Wallet Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Wallet Address</label>
                    <Input value={profileData.walletAddress} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Secret Recovery Phrase</label>
                    <div className="relative">
                      <Input 
                        type={showSeed ? "text" : "password"} 
                        value={profileData.walletSeed}
                        disabled
                      />
                      <button
                        className="absolute right-2 top-2 p-1 rounded-md hover:bg-gray-100"
                        onClick={() => setShowSeed(!showSeed)}
                      >
                        {showSeed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Lock className="w-5 h-5 mr-3" />
                      <div>
                        <div className="font-medium">Two-Factor Authentication</div>
                        <div className="text-sm text-gray-500">Add an extra layer of security</div>
                      </div>
                    </div>
                    <Button variant="outline">Enable</Button>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 mr-3" />
                      <div>
                        <div className="font-medium">Transaction Limits</div>
                        <div className="text-sm text-gray-500">Set daily/monthly limits</div>
                      </div>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Activity className="w-5 h-5 mr-3" />
                      <div>
                        <div className="font-medium">Login History</div>
                        <div className="text-sm text-gray-500">View recent account activity</div>
                      </div>
                    </div>
                    <Button variant="outline">View</Button>
                  </div>
                </div>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      <Shield className="w-5 h-5 mr-2 text-blue-600" />
                      <h3 className="font-medium">Security Level: {profileData.securityLevel}</h3>
                    </div>
                    <p className="text-sm text-gray-600">Your account security is good, but could be improved by enabling 2FA.</p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={transactionStats.monthly}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sent" fill="#ef4444" name="Sent" />
                        <Bar dataKey="received" fill="#22c55e" name="Received" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Currency Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={transactionStats.currencies}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="volume" 
                          stroke="#2563eb" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Monthly Volume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${profileData.monthlyVolume}</div>
                    <div className="text-sm text-green-500">+12.5% from last month</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Transaction Count</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{profileData.transactionCount}</div>
                    <div className="text-sm text-gray-500">This month</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Average Transaction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${(profileData.monthlyVolume / profileData.transactionCount).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">Per transaction</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Account Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-gray-500">Get updates about your transactions</div>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Time Zone</div>
                      <div className="text-sm text-gray-500">Set your local time zone</div>
                    </div>
                    <Button variant="outline">Change</Button>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Language</div>
                      <div className="text-sm text-gray-500">Choose your preferred language</div>
                    </div>
                    <Button variant="outline">Select</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileManagement;
