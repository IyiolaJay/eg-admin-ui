import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout, Button, Toast } from '../components';
import { fetchRewardById, fetchConditionFields, saveRewardConditions } from '../services/rewards';
import type { 
  Reward, 
  ConditionEntity, 
  ConditionLogic, 
  ConditionRule,
  LogicOperator,
  ComparisonOperator 
} from '../types/reward';
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Save,
  Settings,
  Loader2,
} from 'lucide-react';

// Frontend condition structure
interface UICondition {
  id: string;
  entity: string;
  field: string;
  operator: ComparisonOperator;
  value: string;
}

interface UIConditionGroup {
  id: string;
  operator: LogicOperator;
  conditions: UICondition[];
}

// Map field types to available operators
const OPERATORS_BY_TYPE: Record<string, { value: ComparisonOperator; label: string }[]> = {
  string: [
    { value: '==', label: 'Equals' },
    { value: '!=', label: 'Not Equals' },
  ],
  number: [
    { value: '==', label: 'Equals' },
    { value: '!=', label: 'Not Equals' },
    { value: '>', label: 'Greater Than' },
    { value: '<', label: 'Less Than' },
    { value: '>=', label: 'Greater Than or Equal' },
    { value: '<=', label: 'Less Than or Equal' },
  ],
  boolean: [
    { value: '==', label: 'Equals' },
    { value: '!=', label: 'Not Equals' },
  ],
  enum: [
    { value: '==', label: 'Equals' },
    { value: '!=', label: 'Not Equals' },
  ],
};

export const RewardConditions: React.FC = () => {
  const { rewardId } = useParams<{ rewardId: string }>();
  const navigate = useNavigate();
  const [reward, setReward] = useState<Reward | null>(null);
  const [entities, setEntities] = useState<ConditionEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  
  // Condition groups state
  const [conditionGroups, setConditionGroups] = useState<UIConditionGroup[]>([
    {
      id: 'group-1',
      operator: 'and',
      conditions: [],
    },
  ]);

  useEffect(() => {
    if (rewardId) {
      loadData();
    }
  }, [rewardId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both reward and condition fields in parallel
      const [rewardData, fieldsData] = await Promise.all([
        fetchRewardById(rewardId!),
        fetchConditionFields(),
      ]);
      
      setReward(rewardData);
      setEntities(fieldsData.entities);
      
      // If reward has existing conditions, parse them into UI format
      if (rewardData.conditions && rewardData.conditions.length > 0) {
        // Parse existing conditions from API format to UI format
        const parsedGroups = parseLogicToUIGroups(rewardData.conditions);
        if (parsedGroups.length > 0) {
          setConditionGroups(parsedGroups);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Parse API condition logic to UI groups
  const parseLogicToUIGroups = (conditions: any[]): UIConditionGroup[] => {
    // Extract conditions from the logic object
    const extractedConditions: any[] = [];
    
    for (const cond of conditions) {
      const logic = cond.logic;
      if (!logic) continue;
      
      // Check if logic has simple structure (field, operator, value)
      if (logic.field && logic.operator) {
        extractedConditions.push({
          field: logic.field,
          operator: logic.operator,
          value: logic.value,
        });
      }
      // Check if logic has 'and' array
      else if (logic.and && Array.isArray(logic.and)) {
        extractedConditions.push(...logic.and);
      }
      // Check if logic has 'or' array
      else if (logic.or && Array.isArray(logic.or)) {
        extractedConditions.push(...logic.or);
      }
    }

    // Convert to UI conditions
    const uiConditions: UICondition[] = extractedConditions.map((cond, index) => ({
      id: `cond-${index}`,
      entity: cond.field?.split('.')[0] || 'errand',
      field: cond.field?.split('.')[1] || cond.field,
      operator: cond.operator || '==',
      value: String(cond.value || ''),
    }));

    return [{
      id: 'group-existing',
      operator: 'and',
      conditions: uiConditions,
    }];
  };

  // Build API logic object from UI groups
  const buildLogicObject = (): ConditionLogic => {
    if (conditionGroups.length === 0) {
      return { and: [] };
    }

    if (conditionGroups.length === 1) {
      const group = conditionGroups[0];
      const rules: ConditionRule[] = group.conditions.map((cond) => ({
        field: `${cond.entity}.${cond.field}`,
        operator: cond.operator,
        value: convertValue(cond.value, getFieldType(cond.entity, cond.field)),
      }));

      return { [group.operator]: rules };
    }

    // Multiple groups - wrap in outer logic
    const outerOperator: LogicOperator = 'and'; // Groups are always combined with AND
    const groupLogics: (ConditionRule | ConditionLogic)[] = conditionGroups.map((group) => {
      const rules: ConditionRule[] = group.conditions.map((cond) => ({
        field: `${cond.entity}.${cond.field}`,
        operator: cond.operator,
        value: convertValue(cond.value, getFieldType(cond.entity, cond.field)),
      }));

      return { [group.operator]: rules } as ConditionLogic;
    });

    return { [outerOperator]: groupLogics };
  };

  const convertValue = (value: string, fieldType: string): string | number | boolean => {
    if (fieldType === 'boolean') {
      return value.toLowerCase() === 'true';
    }
    if (fieldType === 'number') {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    }
    return value;
  };

  const getFieldType = (entityName: string, fieldName: string): string => {
    const entity = entities.find((e) => e.name === entityName);
    const field = entity?.fields.find((f) => f.name === fieldName);
    return field?.type || 'string';
  };

  const getFieldOptions = (entityName: string, fieldName: string): string[] | undefined => {
    const entity = entities.find((e) => e.name === entityName);
    const field = entity?.fields.find((f) => f.name === fieldName);
    return field?.values;
  };

  const addCondition = (groupId: string) => {
    // Get default entity and field
    const defaultEntity = entities[0];
    const defaultField = defaultEntity?.fields[0];

    setConditionGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              conditions: [
                ...group.conditions,
                {
                  id: `cond-${Date.now()}`,
                  entity: defaultEntity?.name || 'errand',
                  field: defaultField?.name || 'status',
                  operator: '==',
                  value: '',
                },
              ],
            }
          : group
      )
    );
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    setConditionGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              conditions: group.conditions.filter((c) => c.id !== conditionId),
            }
          : group
      )
    );
  };

  const updateCondition = (groupId: string, conditionId: string, updates: Partial<UICondition>) => {
    setConditionGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              conditions: group.conditions.map((cond) => {
                if (cond.id !== conditionId) return cond;
                
                // If entity changes, reset field to first available
                if (updates.entity && updates.entity !== cond.entity) {
                  const entity = entities.find((e) => e.name === updates.entity);
                  const firstField = entity?.fields[0];
                  return {
                    ...cond,
                    ...updates,
                    field: firstField?.name || '',
                    value: '',
                  };
                }
                
                // If field changes, reset value
                if (updates.field && updates.field !== cond.field) {
                  return {
                    ...cond,
                    ...updates,
                    value: '',
                  };
                }
                
                return { ...cond, ...updates };
              }),
            }
          : group
      )
    );
  };

  const updateGroupOperator = (groupId: string, operator: LogicOperator) => {
    setConditionGroups((prev) =>
      prev.map((group) => (group.id === groupId ? { ...group, operator } : group))
    );
  };

  const addGroup = () => {
    setConditionGroups((prev) => [
      ...prev,
      {
        id: `group-${Date.now()}`,
        operator: 'and',
        conditions: [],
      },
    ]);
  };

  const removeGroup = (groupId: string) => {
    setConditionGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const getAvailableOperators = (entityName: string, fieldName: string) => {
    const fieldType = getFieldType(entityName, fieldName);
    return OPERATORS_BY_TYPE[fieldType] || OPERATORS_BY_TYPE.string;
  };

  const handleSave = async () => {
    // Validate all conditions have values
    for (const group of conditionGroups) {
      for (const condition of group.conditions) {
        if (!condition.value.trim()) {
          setToast({
            message: 'Please fill in all condition values',
            type: 'error',
          });
          return;
        }
      }
    }

    setSaving(true);
    try {
      const logic = buildLogicObject();
      
      await saveRewardConditions(rewardId!, { logic });
      
      setToast({
        message: 'Reward conditions saved successfully!',
        type: 'success',
      });
      
      // Navigate back to reward detail
      setTimeout(() => {
        navigate(`/admin/reward-hub/rewards/${rewardId}`);
      }, 1500);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Failed to save conditions',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const formatFieldName = (name: string): string => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-12 h-12 animate-spin text-secondary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !reward) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error || 'Failed to load reward data'}</p>
          <button
            onClick={() => navigate('/admin/reward-hub')}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Back to Reward Hub
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/admin/reward-hub/rewards/${rewardId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Reward Details</span>
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configure Reward Conditions</h1>
            <p className="text-gray-600 mt-1">
              Set up conditions for: <span className="font-semibold text-secondary">{reward.rewardName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-semibold">
              <CheckCircle size={16} />
            </div>
            <span className="text-sm font-medium text-green-600">Reward Created</span>
          </div>
          <div className="flex-1 h-0.5 bg-secondary" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <span className="text-sm font-medium text-secondary">Configure Conditions</span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Condition Builder */}
      <div className="space-y-6">
        {conditionGroups.map((group, groupIndex) => (
          <div
            key={group.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Group Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600">Group {groupIndex + 1}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Match</span>
                  <select
                    value={group.operator}
                    onChange={(e) => updateGroupOperator(group.id, e.target.value as LogicOperator)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  >
                    <option value="and">ALL</option>
                    <option value="or">ANY</option>
                  </select>
                  <span className="text-sm text-gray-500">of the following conditions:</span>
                </div>
              </div>
              {conditionGroups.length > 1 && (
                <button
                  onClick={() => removeGroup(group.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove group"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            {/* Conditions */}
            <div className="p-6 space-y-4">
              {group.conditions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Settings size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No conditions added yet</p>
                  <p className="text-sm">Click &quot;Add Condition&quot; to get started</p>
                </div>
              ) : (
                group.conditions.map((condition, condIndex) => {
                  const availableOperators = getAvailableOperators(condition.entity, condition.field);
                  const fieldType = getFieldType(condition.entity, condition.field);
                  const enumValues = getFieldOptions(condition.entity, condition.field);
                  const currentEntity = entities.find((e) => e.name === condition.entity);

                  return (
                    <div
                      key={condition.id}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      {/* Drag Handle */}
                      <div className="cursor-move text-gray-400 hover:text-gray-600">
                        <GripVertical size={20} />
                      </div>

                      {/* Field Number */}
                      <span className="text-sm font-medium text-gray-500 w-6">{condIndex + 1}.</span>

                      {/* Entity Selector */}
                      <div className="flex-shrink-0 w-32">
                        <select
                          value={condition.entity}
                          onChange={(e) =>
                            updateCondition(group.id, condition.id, { entity: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                        >
                          {entities.map((entity) => (
                            <option key={entity.name} value={entity.name}>
                              {formatFieldName(entity.name)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Field Selector */}
                      <div className="flex-shrink-0 w-40">
                        <select
                          value={condition.field}
                          onChange={(e) =>
                            updateCondition(group.id, condition.id, { field: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                        >
                          {currentEntity?.fields.map((field) => (
                            <option key={field.name} value={field.name}>
                              {formatFieldName(field.name)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Operator Selector */}
                      <div className="flex-shrink-0 w-44">
                        <div className="relative">
                          <select
                            value={condition.operator}
                            onChange={(e) =>
                              updateCondition(group.id, condition.id, {
                                operator: e.target.value as ComparisonOperator,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary appearance-none"
                          >
                            {availableOperators.map((op) => (
                              <option key={op.value} value={op.value}>
                                {op.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={16}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                          />
                        </div>
                      </div>

                      {/* Value Input */}
                      <div className="flex-1">
                        {fieldType === 'boolean' ? (
                          <select
                            value={condition.value}
                            onChange={(e) =>
                              updateCondition(group.id, condition.id, { value: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                          >
                            <option value="">Select...</option>
                            <option value="true">True</option>
                            <option value="false">False</option>
                          </select>
                        ) : fieldType === 'enum' && enumValues ? (
                          <select
                            value={condition.value}
                            onChange={(e) =>
                              updateCondition(group.id, condition.id, { value: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                          >
                            <option value="">Select...</option>
                            {enumValues.map((val) => (
                              <option key={val} value={val}>
                                {val}
                              </option>
                            ))}
                          </select>
                        ) : fieldType === 'number' ? (
                          <input
                            type="number"
                            value={condition.value}
                            onChange={(e) =>
                              updateCondition(group.id, condition.id, { value: e.target.value })
                            }
                            placeholder="Enter value"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                          />
                        ) : (
                          <input
                            type="text"
                            value={condition.value}
                            onChange={(e) =>
                              updateCondition(group.id, condition.id, { value: e.target.value })
                            }
                            placeholder="Enter value"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                          />
                        )}
                      </div>

                      {/* Remove Button */}
                      {group.conditions.length > 1 && (
                        <button
                          onClick={() => removeCondition(group.id, condition.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove condition"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  );
                })
              )}

              {/* Add Condition Button */}
              <button
                onClick={() => addCondition(group.id)}
                className="flex items-center gap-2 px-4 py-2 text-secondary hover:bg-secondary/5 rounded-lg transition-colors text-sm font-medium"
              >
                <Plus size={16} />
                Add Condition
              </button>
            </div>
          </div>
        ))}

        {/* Add Group Button */}
        <button
          onClick={addGroup}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-secondary hover:text-secondary transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={20} />
          Add Condition Group
        </button>

        {/* Logic Preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Settings size={16} />
            Logic Preview
          </h3>
          <div className="text-sm text-blue-900 font-mono bg-white rounded-lg p-4 border border-blue-100 overflow-x-auto">
            <pre>{JSON.stringify(buildLogicObject(), null, 2)}</pre>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/admin/reward-hub/rewards/${rewardId}`)}
            disabled={saving}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            loading={saving}
            disabled={saving || conditionGroups.every(g => g.conditions.length === 0)}
            className="flex-1"
          >
            <span className="flex items-center gap-2 justify-center">
              <Save size={18} />
              Save Conditions
            </span>
          </Button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  );
};