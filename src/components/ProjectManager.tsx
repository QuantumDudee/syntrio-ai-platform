import React, { useState } from 'react';
import { FolderOpen, Plus, Calendar, Download, Trash2, Edit, MessageCircle, Video } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  duration: string;
  createdAt: string;
  status: 'completed' | 'active' | 'draft';
  thumbnail: string;
  type: 'conversation' | 'video';
}

interface ProjectManagerProps {
  onCreateProject: () => void;
}

function ProjectManager({ onCreateProject }: ProjectManagerProps) {
  // Start with empty projects array - users will create their own projects
  const [projects] = useState<Project[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <MessageCircle className="w-4 h-4" />;
      case 'active':
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'draft':
        return <Edit className="w-4 h-4" />;
      default:
        return <Edit className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'conversation':
        return <MessageCircle className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
        </div>
        
        {/* Only show "Create New Conversation" button when user has existing projects */}
        {projects.length > 0 && (
          <button 
            onClick={onCreateProject}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Create New Conversation
          </button>
        )}
      </div>

      {/* Projects Grid - Only show if there are projects */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-200 overflow-hidden">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{project.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                      {project.status}
                    </span>
                    <span className="text-purple-600" title={project.type === 'conversation' ? 'Interactive Conversation' : 'Video'}>
                      {getTypeIcon(project.type)}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  <span>{project.duration}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {project.status === 'completed' && (
                    <>
                      <button className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300 flex items-center justify-center gap-1 text-sm">
                        {project.type === 'conversation' ? (
                          <>
                            <MessageCircle className="w-4 h-4" />
                            Join
                          </>
                        ) : (
                          <>
                            <Video className="w-4 h-4" />
                            Play
                          </>
                        )}
                      </button>
                      <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center">
                        <Download className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {project.status === 'active' && (
                    <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-1 text-sm">
                      <MessageCircle className="w-4 h-4" />
                      Rejoin
                    </button>
                  )}
                  {project.status === 'draft' && (
                    <button className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300 flex items-center justify-center gap-1 text-sm">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  <button className="text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors duration-300 flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State - Show when no projects exist */}
      {projects.length === 0 && (
        <div className="text-center py-20">
          <div className="max-w-lg mx-auto">
            {/* Icon */}
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8">
              <MessageCircle className="w-16 h-16 text-purple-600" />
            </div>
            
            {/* Heading */}
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              No conversations yet
            </h3>
            
            {/* Description */}
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Create your first interactive AI conversation! Experience real-time video chat with AI avatars that understand context and respond naturally.
            </p>
            
            {/* Primary Call to Action */}
            <button 
              onClick={onCreateProject}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto shadow-xl hover:shadow-2xl mb-12"
            >
              <Plus className="w-6 h-6" />
              Start Your First Conversation
            </button>
            
            {/* Process Steps */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
              <p className="text-sm font-semibold text-gray-700 mb-6 uppercase tracking-wide">
                How it works
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
                    1
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Set Context</h4>
                  <p className="text-sm text-gray-600">Provide conversation topics or context for your AI avatar</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
                    2
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Create Conversation</h4>
                  <p className="text-sm text-gray-600">Choose your AI avatar and customize the conversation greeting</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
                    3
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Start Talking</h4>
                  <p className="text-sm text-gray-600">Join the live video conversation and interact naturally</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectManager;