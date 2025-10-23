'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface TestResult {
  name: string
  success: boolean
  errors: string[]
  results?: any
}

export default function TestPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [summary, setSummary] = useState<any>(null)

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])
    setSummary(null)

    try {
      const response = await fetch('/api/test')
      const result = await response.json()

      if (result.success) {
        setTestResults(result.data.summary.testResults)
        setSummary(result.data.summary)
      } else {
        console.error('测试失败:', result.error)
      }
    } catch (error) {
      console.error('测试运行失败:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const runSpecificTest = async (testType: string) => {
    setIsRunning(true)

    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testType })
      })

      const result = await response.json()

      if (result.success) {
        setTestResults([{ name: `${testType}测试`, ...result.data }])
        setSummary({
          totalTests: 1,
          passedTests: result.data.success ? 1 : 0,
          failedTests: result.data.success ? 0 : 1
        })
      } else {
        console.error('测试失败:', result.error)
      }
    } catch (error) {
      console.error('测试运行失败:', error)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            人生模拟器 - 集成测试
          </h1>

          {/* 测试控制 */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              测试控制
            </h2>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={runAllTests}
                  disabled={isRunning}
                  className="px-6 py-3"
                >
                  {isRunning ? '运行中...' : '运行所有测试'}
                </Button>
                
                <Button
                  onClick={() => runSpecificTest('ai')}
                  disabled={isRunning}
                  variant="outline"
                  className="px-6 py-3"
                >
                  AI服务测试
                </Button>
                
                <Button
                  onClick={() => runSpecificTest('engine')}
                  disabled={isRunning}
                  variant="outline"
                  className="px-6 py-3"
                >
                  游戏引擎测试
                </Button>
                
                <Button
                  onClick={() => runSpecificTest('flow')}
                  disabled={isRunning}
                  variant="outline"
                  className="px-6 py-3"
                >
                  完整流程测试
                </Button>
                
                <Button
                  onClick={() => runSpecificTest('performance')}
                  disabled={isRunning}
                  variant="outline"
                  className="px-6 py-3"
                >
                  性能测试
                </Button>
              </div>
            </div>
          </div>

          {/* 测试结果 */}
          {testResults.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                测试结果
              </h2>
              
              {summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {summary.totalTests}
                    </div>
                    <div className="text-sm text-gray-500">总测试数</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {summary.passedTests}
                    </div>
                    <div className="text-sm text-gray-500">通过测试</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {summary.failedTests}
                    </div>
                    <div className="text-sm text-gray-500">失败测试</div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {result.name}
                      </h3>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.success ? '通过' : '失败'}
                      </div>
                    </div>
                    
                    {result.errors && result.errors.length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-red-800 mb-1">
                          错误信息:
                        </h4>
                        <ul className="text-sm text-red-600 space-y-1">
                          {result.errors.map((error, errorIndex) => (
                            <li key={errorIndex}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.results && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-800 mb-1">
                          测试结果:
                        </h4>
                        <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(result.results, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 测试说明 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              测试说明
            </h2>
            
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">AI服务测试</h3>
                <p>测试AI场景生成、选择生成、推理分析和内容审核功能。</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">游戏引擎测试</h3>
                <p>测试游戏开始、会话管理、场景获取等核心功能。</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">完整流程测试</h3>
                <p>测试从开始游戏到做出选择的完整游戏流程。</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">性能测试</h3>
                <p>测试AI调用、内容审核、游戏引擎的性能表现。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
