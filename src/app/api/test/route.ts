import { NextRequest, NextResponse } from 'next/server'
import { TestUtils } from '@/lib/test-utils'

export async function GET(request: NextRequest) {
  try {
    // 运行所有测试
    const testResults = await TestUtils.runAllTests()

    return NextResponse.json({
      success: true,
      data: testResults
    })
  } catch (error) {
    console.error('测试运行失败:', error)
    return NextResponse.json(
      { success: false, error: { code: 'TEST_ERROR', message: '测试运行失败' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { testType } = await request.json()

    let testResults: any

    switch (testType) {
      case 'ai':
        testResults = await TestUtils.testAIService()
        break
      case 'engine':
        testResults = await TestUtils.testGameEngine()
        break
      case 'flow':
        testResults = await TestUtils.testFullGameFlow()
        break
      case 'performance':
        testResults = await TestUtils.testPerformance()
        break
      default:
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_TEST_TYPE', message: '无效的测试类型' } },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: testResults
    })
  } catch (error) {
    console.error('测试运行失败:', error)
    return NextResponse.json(
      { success: false, error: { code: 'TEST_ERROR', message: '测试运行失败' } },
      { status: 500 }
    )
  }
}
