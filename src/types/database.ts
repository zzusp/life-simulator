export interface Database {
  public: {
    Tables: {
      life_types: {
        Row: {
          id: string
          name: string
          description: string
          worldview_prompt: string
          initial_identity: string
          resources: any
          constraints: any
          main_goals: string[]
          is_active: boolean
          version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          worldview_prompt: string
          initial_identity: string
          resources?: any
          constraints?: any
          main_goals?: string[]
          is_active?: boolean
          version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          worldview_prompt?: string
          initial_identity?: string
          resources?: any
          constraints?: any
          main_goals?: string[]
          is_active?: boolean
          version?: number
          created_at?: string
          updated_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          session_id: string
          life_type_id: string
          current_score: number
          game_state: 'playing' | 'completed' | 'abandoned'
          current_scene_id: string | null
          choices_made: any[]
          achievements_unlocked: string[]
          started_at: string
          last_activity_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          life_type_id: string
          current_score?: number
          game_state?: 'playing' | 'completed' | 'abandoned'
          current_scene_id?: string | null
          choices_made?: any[]
          achievements_unlocked?: string[]
          started_at?: string
          last_activity_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          life_type_id?: string
          current_score?: number
          game_state?: 'playing' | 'completed' | 'abandoned'
          current_scene_id?: string | null
          choices_made?: any[]
          achievements_unlocked?: string[]
          started_at?: string
          last_activity_at?: string
          completed_at?: string | null
        }
      }
      scene_nodes: {
        Row: {
          id: string
          life_type_id: string
          scene_number: number
          title: string
          description: string
          ai_generated_content: string
          choices: any[]
          next_scene_rules: any
          is_ending_scene: boolean
          version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          life_type_id: string
          scene_number: number
          title: string
          description: string
          ai_generated_content: string
          choices: any[]
          next_scene_rules?: any
          is_ending_scene?: boolean
          version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          life_type_id?: string
          scene_number?: number
          title?: string
          description?: string
          ai_generated_content?: string
          choices?: any[]
          next_scene_rules?: any
          is_ending_scene?: boolean
          version?: number
          created_at?: string
          updated_at?: string
        }
      }
      player_choices: {
        Row: {
          id: string
          session_id: string
          scene_id: string
          choice_index: number
          choice_text: string
          score_impact: number
          reasoning_summary: string
          ai_prompt_used: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          scene_id: string
          choice_index: number
          choice_text: string
          score_impact: number
          reasoning_summary: string
          ai_prompt_used: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          scene_id?: string
          choice_index?: number
          choice_text?: string
          score_impact?: number
          reasoning_summary?: string
          ai_prompt_used?: string
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          icon_url: string | null
          unlock_conditions: any
          reward_type: 'badge' | 'title' | 'unlock_content'
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon_url?: string | null
          unlock_conditions: any
          reward_type: 'badge' | 'title' | 'unlock_content'
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon_url?: string | null
          unlock_conditions?: any
          reward_type?: 'badge' | 'title' | 'unlock_content'
          is_active?: boolean
          created_at?: string
        }
      }
      session_achievements: {
        Row: {
          id: string
          session_id: string
          achievement_id: string
          unlocked_at: string
          progress_data: any
        }
        Insert: {
          id?: string
          session_id: string
          achievement_id: string
          unlocked_at?: string
          progress_data?: any
        }
        Update: {
          id?: string
          session_id?: string
          achievement_id?: string
          unlocked_at?: string
          progress_data?: any
        }
      }
      leaderboards: {
        Row: {
          id: string
          life_type_id: string
          session_id: string
          score: number
          rank: number
          game_duration: number
          achievements_count: number
          updated_at: string
        }
        Insert: {
          id?: string
          life_type_id: string
          session_id: string
          score: number
          rank: number
          game_duration: number
          achievements_count: number
          updated_at?: string
        }
        Update: {
          id?: string
          life_type_id?: string
          session_id?: string
          score?: number
          rank?: number
          game_duration?: number
          achievements_count?: number
          updated_at?: string
        }
      }
      shared_results: {
        Row: {
          id: string
          session_id: string
          share_token: string
          share_content: any
          view_count: number
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          session_id: string
          share_token: string
          share_content: any
          view_count?: number
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          session_id?: string
          share_token?: string
          share_content?: any
          view_count?: number
          created_at?: string
          expires_at?: string
        }
      }
      ai_prompts: {
        Row: {
          id: string
          name: string
          prompt_type: 'scene_generation' | 'choice_generation' | 'reasoning' | 'moderation'
          content: string
          variables: any
          version: number
          is_active: boolean
          usage_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          prompt_type: 'scene_generation' | 'choice_generation' | 'reasoning' | 'moderation'
          content: string
          variables?: any
          version?: number
          is_active?: boolean
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          prompt_type?: 'scene_generation' | 'choice_generation' | 'reasoning' | 'moderation'
          content?: string
          variables?: any
          version?: number
          is_active?: boolean
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          action_type: 'create' | 'update' | 'delete' | 'view'
          entity_type: string
          entity_id: string
          old_values: any
          new_values: any
          admin_user_id: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          action_type: 'create' | 'update' | 'delete' | 'view'
          entity_type: string
          entity_id: string
          old_values?: any
          new_values?: any
          admin_user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          action_type?: 'create' | 'update' | 'delete' | 'view'
          entity_type?: string
          entity_id?: string
          old_values?: any
          new_values?: any
          admin_user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
