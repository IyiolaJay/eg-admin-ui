import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout, Button, Toast } from '../components';
import { fetchRewardById, fetchConditionFields, updateRewardConditions, deleteRewardConditions } from '../services/rewards';
import type { 
  Reward, 
  ConditionEntity, 
  ConditionLogic, 
  ConditionRule,
  LogicOperator,
  ComparisonOperator,
  RewardCondition,
  UpdateConditionItem
} from '../types/reward';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Save,
  Settings,
  Loader2,
  Pencil,
} from 'lucide-react';

// Frontend rule structure (a single condition within a condition item)
interface UIRule {
  id: string;
  entity: string;
  field: string;
  operator: ComparisonOperator;
  value: string;
}

// Each condition item represents one condition from the API conditions array
interface UIConditionItem {
  id: string;
  originalId?: string; // Original condition ID from API (undefined if new)
  operator: LogicOperator;
  rules: UIRule[];
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
  
  // Condition items state - each item represents one condition from the API array
  const [conditionItems, setConditionItems] = useState<UIConditionItem[]>([]);
  const [originalConditionIds, setOriginalConditionIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (rewardId) {
      loadData();
    }
  }, [rewardId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [rewardData, fieldsData] = await Promise.all([
        fetchRewardById(rewardId!),
        fetchConditionFields(),
      ]);
      
      setReward(rewardData);
      setEntities(fieldsData.entities);
      
      // Parse existing conditions
      if (rewardData.conditions && rewardData.conditions.length > 0) {
        const parsed = parseConditionsToUI(rewardData.conditions);
        setConditionItems(parsed);
        setOriginalConditionIds(new Set(rewardData.conditions.map(c => c.id)));
      } else {
        setConditionItems([createEmptyConditionItem()]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const createEmptyConditionItem = (): UIConditionItem => ({
    id: `new-${Date.now()}`,
    operator: 'and',
    rules: [],
  });

  const createEmptyRule = (): UIRule => {
    const defaultEntity = entities[0];
    const defaultField = defaultEntity?.fields[0];
    return {
      id: `rule-${Date.now()}`,
      entity: defaultEntity?.name || 'errand',
      field: defaultField?.name || 'status',
      operator: '==',
      value: '',
    };
  };

  // Parse API conditions to UI format
  const parseConditionsToUI = (conditions: RewardCondition[]): UIConditionItem[] => {
    return conditions.map((condition, index) => {
      const logic = condition.logic;
      let extractedRules: { field: string; operator: string; value: any }[] = [];
      let operator: LogicOperator = 'and';
      
      if (logic) {
        if (logic.and && Array.isArray(logic.and)) {
          extractedRules = logic.and.map(r => ({ field: r.field || '', operator: r.operator || '==', value: r.value }));
          operator = 'and';
        } else if (logic.or && Array.isArray(logic.or)) {
          extractedRules = logic.or.map(r => ({ field: r.field || '', operator: r.operator || '==', value: r.value }));
          operator = 'or';
        } else if (logic.field && logic.operator) {
          extractedRules = [{ field: logic.field, operator: logic.operator, value: logic.value }];
        }
      }

      const uiRules: UIRule[] = extractedRules.map((rule) => ({
        id: `rule-${index}-${Math.random()}`,
        entity: rule.field?.split('.')[0] || 'errand',
        field: rule.field?.split('.')[1] || rule.field || 'status',
        operator: rule.operator as ComparisonOperator,
        value: String(rule.value || ''),
      }));

      return {
        id: `condition-${index}`,
        originalId: condition.id,
        operator,
        rules: uiRules,
      };
    });
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

  const getAvailableOperators = (entityName: string, fieldName: string) => {
    const fieldType = getFieldType(entityName, fieldName);
    return OPERATORS_BY_TYPE[fieldType] || OPERATORS_BY_TYPE.string;
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

  // Add a new condition item
  const addConditionItem = () => {
    setConditionItems(prev => [...prev, createEmptyConditionItem()]);
  };

  // Remove a condition item
  const removeConditionItem = (itemId: string) => {
    setConditionItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Add a rule to a condition item
  const addRule = (itemId: string) => {
    setConditionItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, rules: [...item.rules, createEmptyRule()] }
          : item
      )
    );
  };

  // Remove a rule from a condition item
  const removeRule = (itemId: string, ruleId: string) => {
    setConditionItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, rules: item.rules.filter(r => r.id !== ruleId) }
          : item
      )
    );
  };

  // Update a rule
  const updateRule = (itemId: string, ruleId: string, updates: Partial<UIRule>) => {
    setConditionItems(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;
        
        return {
          ...item,
          rules: item.rules.map(rule => {
            if (rule.id !== ruleId) return rule;
            
            // If entity changes, reset field and value
            if (updates.entity && updates.entity !== rule.entity) {
              const entity = entities.find(e => e.name === updates.entity);
              const firstField = entity?.fields[0];
              return {
                ...rule,
                ...updates,
                field: firstField?.name || '',
                value: '',
              };
            }
            
            // If field changes, reset value
            if (updates.field && updates.field !== rule.field) {
              return { ...rule, ...updates, value: '' };
            }
            
            return { ...rule, ...updates };
          }),
        };
      })
    );
  };

  // Update condition item operator
  const updateItemOperator = (itemId: string, operator: LogicOperator) => {
    setConditionItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, operator } : item))
    );
  };

  const formatFieldName = (name: string): string => {
    return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const handleSave = async () => {
    // Validate all rules have values
    for (const item of conditionItems) {
      for (const rule of item.rules) {
        if (!rule.value.trim()) {
          setToast({ message: 'Please fill in all condition values', type: 'error' });
          return;
        }
      }
    }

    setSaving(true);
    try {
      // Delete conditions that were removed
      const currentConditionIds = new Set(conditionItems.map(i => i.originalId).filter(Boolean));
      const idsToDelete: string[] = [];
      for (const originalId of originalConditionIds) {
        if (!currentConditionIds.has(originalId)) {
          idsToDelete.push(originalId!);
        }
      }

      // Only call delete if there are conditions to delete
      if (idsToDelete.length > 0) {
        await deleteRewardConditions(idsToDelete);
      }

      // Build conditions array for update
      const conditions: UpdateConditionItem[] = conditionItems.map(item => {
        const rules: ConditionRule[] = item.rules.map(rule => ({
          field: `${rule.entity}.${rule.field}`,
          operator: rule.operator,
          value: convertValue(rule.value, getFieldType(rule.entity, rule.field)),
        }));
        const logic: ConditionLogic = { [item.operator]: rules };
        
        return {
          ...(item.originalId && { id: item.originalId }),
          logic,
        };
      });

      // Only call update if there are conditions to save
      if (conditions.length > 0) {
        const result = await updateRewardConditions(rewardId!, { conditions });
        
        setToast({ 
          message: `Conditions saved: ${result.updated} updated, ${result.created} created`, 
          type: 'success' 
        });
      } else {
        setToast({ 
          message: 'No conditions to save', 
          type: 'success' 
        });
      }
      
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

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {conditionItems.map((item, itemIndex) => {
          const isExisting = !!item.originalId;
          
          return (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {isExisting ? (
                      <Pencil size={16} className="text-blue-500" />
                    ) : (
                      <Plus size={16} className="text-green-500" />
                    )}
                    <span className="text-sm font-medium text-gray-600">
                      Condition {itemIndex + 1} {isExisting ? '(Existing)' : '(New)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Match</span>
                    <select
                      value={item.operator}
                      onChange={(e) => updateItemOperator(item.id, e.target.value as LogicOperator)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                    >
                      <option value="and">ALL</option>
                      <option value="or">ANY</option>
                    </select>
                    <span className="text-sm text-gray-500">of the following:</span>
                  </div>
                </div>
                <button
                  onClick={() => removeConditionItem(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove condition"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {item.rules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Settings size={32} className="mx-auto mb-2 text-gray-300" />
                    <p>No rules added yet</p>
                    <button
                      onClick={() => addRule(item.id)}
                      className="text-secondary hover:text-secondary/80 text-sm font-medium mt-2"
                    >
                      Add Rule
                    </button>
                  </div>
                ) : (
                  item.rules.map((rule, ruleIndex) => {
                    const availableOperators = getAvailableOperators(rule.entity, rule.field);
                    const fieldType = getFieldType(rule.entity, rule.field);
                    const enumValues = getFieldOptions(rule.entity, rule.field);
                    const currentEntity = entities.find(e => e.name === rule.entity);

                    return (
                      <div key={rule.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="text-sm font-medium text-gray-500 w-6">{ruleIndex + 1}.</span>

                        <div className="flex-shrink-0 w-32">
                          <select
                            value={rule.entity}
                            onChange={(e) => updateRule(item.id, rule.id, { entity: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                          >
                            {entities.map(entity => (
                              <option key={entity.name} value={entity.name}>
                                {formatFieldName(entity.name)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex-shrink-0 w-40">
                          <select
                            value={rule.field}
                            onChange={(e) => updateRule(item.id, rule.id, { field: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                          >
                            {currentEntity?.fields.map(field => (
                              <option key={field.name} value={field.name}>
                                {formatFieldName(field.name)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex-shrink-0 w-44">
                          <select
                            value={rule.operator}
                            onChange={(e) => updateRule(item.id, rule.id, { operator: e.target.value as ComparisonOperator })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                          >
                            {availableOperators.map(op => (
                              <option key={op.value} value={op.value}>
                                {op.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex-1">
                          {fieldType === 'boolean' ? (
                            <select
                              value={rule.value}
                              onChange={(e) => updateRule(item.id, rule.id, { value: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                            >
                              <option value="">Select...</option>
                              <option value="true">True</option>
                              <option value="false">False</option>
                            </select>
                          ) : fieldType === 'enum' && enumValues ? (
                            <select
                              value={rule.value}
                              onChange={(e) => updateRule(item.id, rule.id, { value: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                            >
                              <option value="">Select...</option>
                              {enumValues.map(val => (
                                <option key={val} value={val}>{val}</option>
                              ))}
                            </select>
                          ) : fieldType === 'number' ? (
                            <input
                              type="number"
                              value={rule.value}
                              onChange={(e) => updateRule(item.id, rule.id, { value: e.target.value })}
                              placeholder="Enter value"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                            />
                          ) : (
                            <input
                              type="text"
                              value={rule.value}
                              onChange={(e) => updateRule(item.id, rule.id, { value: e.target.value })}
                              placeholder="Enter value"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                            />
                          )}
                        </div>

                        {item.rules.length > 1 && (
                          <button
                            onClick={() => removeRule(item.id, rule.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}

                <button
                  onClick={() => addRule(item.id)}
                  className="flex items-center gap-2 px-4 py-2 text-secondary hover:bg-secondary/5 rounded-lg transition-colors text-sm font-medium"
                >
                  <Plus size={16} />
                  Add Rule
                </button>
              </div>
            </div>
          );
        })}

        <button
          onClick={addConditionItem}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-secondary hover:text-secondary transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={20} />
          Add New Condition
        </button>

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
            disabled={saving || conditionItems.every(item => item.rules.length === 0)}
            className="flex-1"
          >
            <span className="flex items-center gap-2 justify-center">
              <Save size={18} />
              Save Conditions
            </span>
          </Button>
        </div>
      </div>

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
