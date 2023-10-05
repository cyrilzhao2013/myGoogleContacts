"use client";

import { ReactNode, useState, ChangeEvent, useEffect } from "react";
import { debounce } from "lodash-es";
import styles from "./style.module.css";

export interface IOption {
  label: string;
  value: string | number;
}

export interface IProps {
  prefix?: ReactNode;
  options: IOption[];
  width: number;
  placeholder?: string;
  search: (keyword: string) => Promise<any>;
  renderOption?: (option: IOption) => ReactNode;
  onSelect: (value: string | number, option: IOption) => void;
}

export default function SearchInput(props: IProps) {
  const {
    prefix,
    options,
    width,
    placeholder,
    renderOption,
    search,
    onSelect,
  } = props;
  const [focused, setFocused] = useState<boolean>(false);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  const handleInputChanged = debounce(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      await search?.(value);
    },
    300
  );

  const handleSelect = (option: IOption) => {
    setDropdownVisible(false);
    onSelect(option.value, option);
  };

  useEffect(() => {
    setDropdownVisible(!!options.length);
  }, [options]);

  return (
    <div
      className={`${styles.searchInput} ${
        focused ? styles.searchInputFocused : ""
      }`}
      style={{
        width: `${width}px`,
      }}
    >
      {prefix}
      <input
        type="text"
        className={styles.searchInputInner}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={handleInputChanged}
        placeholder={placeholder || "Please search"}
      />
      {dropdownVisible ? (
        <div
          className={styles.mask}
          onClick={() => setDropdownVisible(false)}
        ></div>
      ) : null}
      {dropdownVisible ? (
        <div
          className={styles.searchResultDropdown}
          style={{
            width: `${width}px`,
          }}
        >
          {options.map((option) => {
            return (
              <div
                className={styles.searchResultOption}
                onClick={() => handleSelect(option)}
                key={option.value}
              >
                {renderOption ? renderOption(option) : option.label}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
