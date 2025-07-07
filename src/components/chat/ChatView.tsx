import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Send,
  Sparkles,
  BookOpen,
  FileText,
  Video,
  PenTool,
  Lightbulb,
  Clock,
  Users,
  Target,
  Zap,
  Bot,
  User as UserIcon,
  Copy,
  RefreshCw,
  Upload,
  Code,
  Image as ImageIcon,
  FileUp,
  X,
  Plus,
  Settings,
  Play,
  Edit3
} from 'lucide-react';
import './styles/ChatView.css';

interface UploadedFile {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'image';
  size: number;
  url: string;
  file: File;
}

interface CodePrompt {
  code: string;
  language: string;
  canEdit: boolean;
  canRun: boolean;
  description: string;
}

interface StructuredPrompt {
  type: 'code' | 'text';
  content: string;
  codePrompt?: CodePrompt;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  attachments?: UploadedFile[];
  structuredPrompt?: StructuredPrompt;
}

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: 'course' | 'module' | 'assessment' | 'content';
  icon: React.ReactNode;
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'basic-course',
    title: 'Create Basic Course',
    description: 'Generate a complete course structure with modules and lessons',
    prompt: 'Create a comprehensive course about [TOPIC] for [BEGINNER/INTERMEDIATE/ADVANCED] level learners. Include:\n- Course overview and objectives\n- 4-6 modules with detailed descriptions\n- Learning outcomes for each module\n- Estimated duration\n- Prerequisites',
    category: 'course',
    icon: <BookOpen className="w-4 h-4" />
  },
  {
    id: 'interactive-content',
    title: 'Interactive Content',
    description: 'Generate engaging interactive lessons and activities',
    prompt: 'Create interactive content for [TOPIC] that includes:\n- Hands-on exercises and practical examples\n- Code challenges or real-world scenarios\n- Interactive quizzes and assessments\n- Visual aids and diagrams\n- Progressive difficulty levels',
    category: 'content',
    icon: <Zap className="w-4 h-4" />
  },
  {
    id: 'assessment-generator',
    title: 'Assessment Generator',
    description: 'Create comprehensive assessments and quizzes',
    prompt: 'Generate a comprehensive assessment for [TOPIC] including:\n- 10 multiple choice questions\n- 5 short answer questions\n- 2 practical exercises\n- Answer key with explanations\n- Difficulty progression from basic to advanced',
    category: 'assessment',
    icon: <PenTool className="w-4 h-4" />
  },
  {
    id: 'video-script',
    title: 'Video Script',
    description: 'Generate engaging video lesson scripts',
    prompt: 'Create a detailed video script for [TOPIC] that includes:\n- Engaging hook and introduction\n- Clear learning objectives\n- Step-by-step explanations with examples\n- Visual cues and demonstrations\n- Summary and call-to-action\n- Estimated duration: [TIME]',
    category: 'content',
    icon: <Video className="w-4 h-4" />
  }
];

const EXAMPLE_PROMPTS = [
  "Create a Python programming course for complete beginners with hands-on projects",
  "Generate an advanced React course focusing on performance optimization and best practices",
  "Design a cybersecurity fundamentals course with practical labs and real-world scenarios",
  "Create a data science course using Python, including machine learning basics"
];

const ChatView = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "👋 Hi! I'm your AI Course Assistant. I can help you create comprehensive courses, interactive content, assessments, and learning materials. \n\nYou can upload files (PDF, videos, images) or create structured prompts with code. What would you like to create today?",
      timestamp: new Date(),
      status: 'sent'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'text' | 'upload' | 'code'>('text');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [codePrompt, setCodePrompt] = useState<CodePrompt>({
    code: '',
    language: 'javascript',
    canEdit: true,
    canRun: false,
    description: ''
  });
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if ((!prompt.trim() && uploadedFiles.length === 0 && inputMode === 'text') || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: prompt || (uploadedFiles.length > 0 ? `Uploaded ${uploadedFiles.length} file(s)` : 'Code prompt'),
      timestamp: new Date(),
      status: 'sent',
      attachments: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined,
      structuredPrompt: inputMode === 'code' ? { type: 'code', content: prompt, codePrompt } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setUploadedFiles([]);
    setCodePrompt({
      code: '',
      language: 'javascript',
      canEdit: true,
      canRun: false,
      description: ''
    });
    setInputMode('text');
    setIsLoading(true);

    // Simulate AI response (replace with actual AI API call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateMockResponse(userMessage.content, userMessage.attachments, userMessage.structuredPrompt),
        timestamp: new Date(),
        status: 'sent'
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const generateMockResponse = (userPrompt: string, attachments?: UploadedFile[], structuredPrompt?: StructuredPrompt): string => {
    let response = `🎯 **Course Generation Plan**\n\nBased on your request: "${userPrompt}"\n\n`;

    if (attachments && attachments.length > 0) {
      response += `📎 **Uploaded Files Analysis**\n`;
      attachments.forEach(file => {
        response += `- ${file.name} (${file.type.toUpperCase()}) - ${Math.round(file.size / 1024)}KB\n`;
      });
      response += `\nI'll incorporate these files into the course content.\n\n`;
    }

    if (structuredPrompt?.codePrompt) {
      response += `💻 **Code Integration**\n`;
      response += `- Language: ${structuredPrompt.codePrompt.language}\n`;
      response += `- Interactive: ${structuredPrompt.codePrompt.canEdit ? 'Yes' : 'No'}\n`;
      response += `- Executable: ${structuredPrompt.codePrompt.canRun ? 'Yes' : 'No'}\n`;
      response += `- Description: ${structuredPrompt.codePrompt.description}\n\n`;
    }

    response += `I'll create a comprehensive course structure with the following components:

📚 **Course Overview**
- Target audience analysis
- Learning objectives and outcomes
- Prerequisites and requirements
- Estimated completion time

🏗️ **Module Structure**
- Module 1: Introduction and Fundamentals
- Module 2: Core Concepts and Theory
- Module 3: Practical Applications
- Module 4: Advanced Topics
- Module 5: Projects and Assessment

📋 **Content Types**
- Video lessons with interactive elements
- Hands-on exercises and coding challenges
- Downloadable resources and cheat sheets
- Quizzes and knowledge checks
- Final capstone project

⚡ **Next Steps**
I can now generate specific content for any module or create detailed assessments. What would you like me to focus on first?`;

    return response;
  };

  const handleTemplateSelect = (template: PromptTemplate) => {
    setSelectedTemplate(template.id);
    setPrompt(template.prompt);
    textareaRef.current?.focus();
  };

  const handleExampleSelect = (example: string) => {
    setPrompt(example);
    textareaRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const regenerateResponse = (messageId: string) => {
    // Implementation for regenerating AI responses
    console.log('Regenerating response for message:', messageId);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const fileType = file.type.startsWith('image/') ? 'image' : 
                      file.type === 'application/pdf' ? 'pdf' : 
                      file.type.startsWith('video/') ? 'video' : null;
      
      if (fileType) {
        const newFile: UploadedFile = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: fileType,
          size: file.size,
          url: URL.createObjectURL(file),
          file
        };
        setUploadedFiles(prev => [...prev, newFile]);
      }
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file) {
        URL.revokeObjectURL(file.url);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const handleCodeSubmit = () => {
    setInputMode('code');
    setShowCodeDialog(false);
    if (codePrompt.code || codePrompt.description) {
      setPrompt(codePrompt.description || 'Code snippet included');
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'image': return <ImageIcon className="w-4 h-4" />;
      default: return <FileUp className="w-4 h-4" />;
    }
  };

  return (
    <div className="ai-chat-container">
      {/* Template Suggestions */}
      {messages.length <= 1 && (
        <div className="template-section">
          <h4>Quick Start Templates</h4>
          <div className="template-grid">
            {PROMPT_TEMPLATES.map((template) => (
              <Card 
                key={template.id}
                className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader className="template-header">
                  <div className="template-icon">
                    {template.icon}
                  </div>
                  <CardTitle className="template-title">{template.title}</CardTitle>
                </CardHeader>
                <CardContent className="template-content">
                  <p>{template.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="example-prompts">
            <h5>Example Prompts</h5>
            <div className="example-list">
              {EXAMPLE_PROMPTS.map((example, index) => (
                <button
                  key={index}
                  className="example-prompt"
                  onClick={() => handleExampleSelect(example)}
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>{example}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-avatar">
              {message.type === 'ai' ? (
                <Bot className="w-5 h-5" />
              ) : (
                <UserIcon className="w-5 h-5" />
              )}
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="message-sender">
                  {message.type === 'ai' ? 'AI Assistant' : 'You'}
                </span>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="message-text">
                <pre className="message-pre">{message.content}</pre>
                
                {/* File Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="message-attachments">
                    {message.attachments.map(file => (
                      <div key={file.id} className="attachment-item">
                        {getFileIcon(file.type)}
                        <span className="attachment-name">{file.name}</span>
                        <span className="attachment-size">({Math.round(file.size / 1024)}KB)</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Structured Code Prompt */}
                {message.structuredPrompt?.codePrompt && (
                  <div className="code-prompt-display">
                    <div className="code-prompt-header">
                      <Code className="w-4 h-4" />
                      <span>Code Snippet - {message.structuredPrompt.codePrompt.language}</span>
                      <div className="code-settings">
                        {message.structuredPrompt.codePrompt.canEdit && <Edit3 className="w-3 h-3" />}
                        {message.structuredPrompt.codePrompt.canRun && <Play className="w-3 h-3" />}
                      </div>
                    </div>
                    {message.structuredPrompt.codePrompt.description && (
                      <div className="code-description">{message.structuredPrompt.codePrompt.description}</div>
                    )}
                    <pre className="code-content">{message.structuredPrompt.codePrompt.code}</pre>
                  </div>
                )}
              </div>
              {message.type === 'ai' && (
                <div className="message-actions">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(message.content)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => regenerateResponse(message.id)}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai">
            <div className="message-avatar">
              <Bot className="w-5 h-5" />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        {/* Upload Files Display */}
        {uploadedFiles.length > 0 && (
          <div className="uploaded-files-preview">
            <h4>Uploaded Files:</h4>
            <div className="files-list">
              {uploadedFiles.map(file => (
                <div key={file.id} className="file-preview">
                  {getFileIcon(file.type)}
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">({Math.round(file.size / 1024)}KB)</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(file.id)}
                    className="remove-file"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code Mode Display */}
        {inputMode === 'code' && (codePrompt.code || codePrompt.description) && (
          <div className="code-preview">
            <div className="code-preview-header">
              <Code className="w-4 h-4" />
              <span>Code Snippet Ready</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setInputMode('text')}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            {codePrompt.description && (
              <div className="code-preview-description">{codePrompt.description}</div>
            )}
            <div className="code-preview-settings">
              Language: {codePrompt.language} | 
              {codePrompt.canEdit && ' Editable'} |
              {codePrompt.canRun && ' Runnable'}
            </div>
          </div>
        )}

        {/* Input Mode Selector */}
        <div className="input-mode-selector">
          <Button
            size="sm"
            variant={inputMode === 'text' ? 'default' : 'ghost'}
            onClick={() => setInputMode('text')}
          >
            <FileText className="w-4 h-4" />
            Text
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            Upload
          </Button>

          <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant={inputMode === 'code' ? 'default' : 'ghost'}
              >
                <Code className="w-4 h-4" />
                Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Code Snippet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Describe what this code does..."
                    value={codePrompt.description}
                    onChange={(e) => setCodePrompt(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="language">Programming Language</Label>
                  <Select 
                    value={codePrompt.language} 
                    onValueChange={(value) => setCodePrompt(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="css">CSS</SelectItem>
                      <SelectItem value="sql">SQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="code">Code</Label>
                  <Textarea
                    id="code"
                    placeholder="Enter your code here..."
                    value={codePrompt.code}
                    onChange={(e) => setCodePrompt(prev => ({ ...prev, code: e.target.value }))}
                    rows={10}
                    className="font-mono"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canEdit"
                      checked={codePrompt.canEdit}
                      onCheckedChange={(checked) => setCodePrompt(prev => ({ ...prev, canEdit: checked as boolean }))}
                    />
                    <Label htmlFor="canEdit">Students can edit this code</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canRun"
                      checked={codePrompt.canRun}
                      onCheckedChange={(checked) => setCodePrompt(prev => ({ ...prev, canRun: checked as boolean }))}
                    />
                    <Label htmlFor="canRun">Students can run this code</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCodeDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCodeSubmit}>
                    Add Code
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="input-container">
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              inputMode === 'code' ? "Describe how you want to use this code in your course..." :
              uploadedFiles.length > 0 ? "Describe how these files should be used in your course..." :
              "Describe the course you want to create... (e.g., 'Create a beginner Python course with hands-on projects')"
            }
            className="chat-textarea"
            rows={3}
          />
          <Button
            onClick={handleSendMessage}
            disabled={(!prompt.trim() && uploadedFiles.length === 0 && inputMode === 'text') || isLoading}
            className="send-button"
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="input-footer">
          <div className="input-tips">
            <Target className="w-4 h-4" />
            <span>
              {inputMode === 'code' ? 'Code snippets help create interactive programming lessons' :
               uploadedFiles.length > 0 ? 'Files will be analyzed and integrated into your course' :
               'Be specific about your target audience, topic, and desired learning outcomes'}
            </span>
          </div>
          <div className="character-count">
            {prompt.length}/2000
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.mp4,.mov,.avi,.jpg,.jpeg,.png,.gif"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default ChatView; 