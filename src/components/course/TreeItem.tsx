import React, { useState } from 'react';
import { ChevronRightIcon, FolderIcon, FileIcon, SlideIcon } from '../common/icons/icons';
import type { Slide } from './courseData';

interface TreeItemProps {
  label: string;
  isFolder?: boolean;
  children?: React.ReactNode;
  level?: number;
  slide?: Slide;
  itemType?: 'subject' | 'module' | 'chapter' | 'slide';
  isSelected?: boolean;
  onSelect?: () => void;
  slideCount?: number;
  completedSlides?: number;
  forceExpanded?: boolean;
}

export const TreeItem: React.FC<TreeItemProps> = ({ 
  label, 
  isFolder, 
  children, 
  level = 0, 
  slide,
  itemType = 'slide',
  isSelected = false,
  onSelect,
  slideCount,
  completedSlides = 0,
  forceExpanded
}) => {
  const [isOpen, setIsOpen] = useState(level <= 1);
  
  const actualIsOpen = forceExpanded !== undefined ? forceExpanded : isOpen;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = () => {
    onSelect?.();
  };

  const getIndentStyle = () => {
    const baseIndent = 8;
    const indentPerLevel = 12;
    return {
      paddingLeft: `${baseIndent + (level * indentPerLevel)}px`
    };
  };

  const getBadgeText = () => {
    if (slide) {
      return slide.type.substring(0, 3).toUpperCase();
    }
    if (itemType === 'module' && slideCount) {
      return `${completedSlides}/${slideCount}`;
    }
    if (itemType === 'chapter' && slideCount) {
      return slideCount.toString();
    }
    return null;
  };

  const getBadgeClass = () => {
    if (slide) {
      return slide.type;
    }
    return '';
  };

  const getProgressPercentage = () => {
    if (slideCount && slideCount > 0) {
      return Math.max(3, (completedSlides / slideCount) * 100);
    }
    return 0;
  };

  const itemClasses = [
    'tree-item',
    itemType,
    isSelected ? 'selected' : ''
  ].filter(Boolean).join(' ');

  const truncateLabel = (text: string) => {
    const maxLength = itemType === 'slide' ? 25 : 30;
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 2) + '..';
  };

  return (
    <>
      <div 
        className={itemClasses}
        style={getIndentStyle()}
        onClick={handleSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect();
          } else if (e.key === 'ArrowRight' && isFolder && !isOpen) {
            e.preventDefault();
            setIsOpen(true);
          } else if (e.key === 'ArrowLeft' && isFolder && isOpen) {
            e.preventDefault();
            setIsOpen(false);
          }
        }}
      >
        <span className="tree-item-icon" onClick={handleToggle}>
          {isFolder && (
            <span className={`chevron ${actualIsOpen ? 'open' : ''}`}>
              <ChevronRightIcon />
            </span>
          )}
          {isFolder ? (
            <FolderIcon isOpen={actualIsOpen} />
          ) : (
            slide ? <SlideIcon type={slide.type} /> : <FileIcon />
          )}
        </span>
        
        <span className="tree-item-label" title={label}>
          {truncateLabel(label)}
        </span>
        
        {getBadgeText() && (
          <span className={`tree-item-badge ${getBadgeClass()}`}>
            {getBadgeText()}
          </span>
        )}
        
        {itemType === 'module' && slideCount && slideCount > 0 && (
          <div className="module-progress" title={`${Math.round(getProgressPercentage())}% complete`}>
            <div 
              className="module-progress-fill"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        )}
      </div>
      
      {isFolder && actualIsOpen && children && (
        <div className="tree-item-children">
          {children}
        </div>
      )}
    </>
  );
};
