import { Upload, Button, Table } from 'antd'
import { useState } from 'react'
import { UploadOutlined } from '@ant-design/icons'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
// import request from '@/utils/request'

export default function SmartImport() {
  const [questions, setQuestions] = useState<any[]>([])

  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    // const res = await request.post('/teacher/import', formData)
    // setQuestions(res.questions)
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return
    const items = Array.from(questions)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    setQuestions(items)
  }

  const columns = [
    { title: '顺序', dataIndex: 'index', render: (_: any, __: any, index: number) => index + 1 },
    { title: '题目内容', dataIndex: 'content' },
    { title: '题型', dataIndex: 'type' },
  ]

  return (
    <div>
      <Upload beforeUpload={(file) => { handleUpload(file); return false }} accept=".xlsx,.docx">
        <Button icon={<UploadOutlined />}>导入试卷文件</Button>
      </Upload>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {questions.map((q, idx) => (
                <Draggable key={q.id} draggableId={q.id} index={idx}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <Table columns={columns} dataSource={[q]} pagination={false} size="small" />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}