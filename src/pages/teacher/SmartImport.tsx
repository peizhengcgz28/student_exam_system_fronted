import { Upload, Button, Card, Typography, message, Table } from 'antd'
import { useState } from 'react'
import { UploadOutlined, DownloadOutlined, DragOutlined, CheckOutlined } from '@ant-design/icons'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

export default function SmartImport() {
  const [fileName, setFileName] = useState('')
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // 模拟数据
  const mockData = [
    { id: '1', content: '第一题：React 是什么？', type: '单选题', score: 5, answer: 'A' },
    { id: '2', content: '第二题：useState 的作用？', type: '单选题', score: 5, answer: 'B' },
    { id: '3', content: '第三题：简述 useEffect 用途', type: '简答题', score: 10, answer: '副作用处理' },
  ]

  // 文件格式校验（只许 .xlsx）
  const beforeUpload = (file: File) => {
    const isXlsx = file.name.toLowerCase().endsWith('.xlsx')
    if (!isXlsx) {
      message.error('仅支持 .xlsx 格式文件')
      return false
    }
    return true
  }

  // 上传文件
  const handleUpload = (file: File) => {
    setFileName(file.name)
    message.success(`已选择文件：${file.name}`)
    setQuestions(mockData)
    return false
  }

  // 下载模板
  const handleDownloadTemplate = () => {
    const link = document.createElement('a')
    link.href = '/template/question_import_template.xlsx'
    link.download = '题库导入模板.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    message.success('模板已开始下载')
  }

  // 拖拽结束
  const onDragEnd = (result: any) => {
    if (!result.destination) return
    const items = [...questions]
    const [removed] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, removed)
    setQuestions(items)
  }

  // 确认导入（提交后端）
  const handleConfirmImport = async () => {
    if (questions.length === 0) {
      message.warning('请先上传题目文件')
      return
    }
    setLoading(true)
    try {
      // 这里替换成你的后端接口
      // await request.post('/teacher/import', { list: questions })
      console.log('提交后端数据：', questions)
      message.success(`成功导入 ${questions.length} 道题目`)
      // 可选：清空预览
      // setQuestions([])
      // setFileName('')
    } catch (e) {
      message.error('导入失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 表格列（TS 类型已修复）
  const columns = [
    {
      title: '排序',
      width: 60,
      render: () => <DragOutlined style={{ color: '#999' }} />,
      align: 'center' as const,
    },
    {
      title: '题目内容',
      dataIndex: 'content',
    },
    {
      title: '题型',
      dataIndex: 'type',
      width: 100,
    },
    {
      title: '分值',
      dataIndex: 'score',
      width: 70,
    },
    {
      title: '标准答案',
      dataIndex: 'answer',
      width: 120,
    },
  ]

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <Typography.Title level={4} style={{ marginBottom: 4 }}>
        批量导入题库
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 20 }}>
        支持 Excel（.xlsx）批量导入，可拖拽调整题目顺序
      </Typography.Paragraph>

      {/* 模板下载 */}
      <Card title="导入模板下载" size="small" style={{ marginBottom: 20 }}>
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
          下载标准模板（.xlsx）
        </Button>
        <div style={{ marginTop: 10, fontSize: 13, color: '#666' }}>
          请严格按模板格式填写，否则可能导入失败
        </div>
      </Card>

      {/* 上传区 */}
      <Card title="上传Excel文件" size="small" style={{ marginBottom: 20 }}>
        <Upload
          beforeUpload={beforeUpload}
          customRequest={({ file }) => handleUpload(file as File)}
          accept=".xlsx"
          fileList={[]}
        >
          <Button icon={<UploadOutlined />}>
            {fileName ? `已选择：${fileName}` : '选择 Excel 文件'}
          </Button>
        </Upload>
        <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
          仅支持 .xlsx 格式
        </div>
      </Card>

      {/* 拖拽表格 + 确认按钮 */}
      {questions.length > 0 && (
        <Card
          title="导入预览（可拖拽排序）"
          size="small"
          extra={
            <Button
              type="primary"
              icon={<CheckOutlined />}
              loading={loading}
              onClick={handleConfirmImport}
            >
              确认导入题库
            </Button>
          }
        >
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="table-body">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {questions.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            marginBottom: 8,
                            background: '#fff',
                            borderRadius: 4,
                            border: '1px solid #e8e8e8',
                          }}
                        >
                          <Table
                            columns={columns}
                            dataSource={[item]}
                            pagination={false}
                            size="small"
                            rowKey="id"
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Card>
      )}
    </div>
  )
}